import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

// Extend Socket interface to include user property
interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    username: string;
    email: string;
    role?: string;
  };
}
import { SendMessageDto, JoinConversationDto } from './dto/chat.dto';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { AuthService } from '../auth/auth.service';
import { RateLimiterGuard } from '../auth/rate-limiter.guard';
import { ChatLoggerService } from '../common/logger.service';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://web-5it9deahv-setaraindonesias-projects.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly logger: ChatLoggerService
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.debug(`Client connected: ${client.id}`);
    
    try {
      // Authenticate client on connection
      const token = this.authService.extractTokenFromSocket(client);
      
      if (!token) {
        // Development mode: allow connections without token for testing
        if (process.env.NODE_ENV === 'development') {
          client.user = {
            userId: `test_user_${client.id}`,
            username: `testuser_${client.id.substring(0, 4)}`,
            email: `test_${client.id}@test.com`,
            role: 'USER'
          };
          
          this.connectedUsers.set(client.user.userId, client);
          
          this.logger.logUserAction(client.user.userId, 'websocket_connected_dev', { 
            clientId: client.id,
            username: client.user.username 
          });
          
          client.emit('authenticated', { 
            message: 'Successfully authenticated (dev mode)',
            user: client.user 
          });
          return;
        }
        
        this.logger.logAuthenticationFailure('No token provided', { clientId: client.id });
        client.emit('error', { 
          code: 'AUTH_REQUIRED',
          message: 'Authentication token required' 
        });
        client.disconnect();
        return;
      }

      const payload = await this.authService.verifyToken(token);
      
      // Store user info in client
      client.user = payload;
      
      // Store connection mapping
      this.connectedUsers.set(payload.userId, client);
      
      this.logger.logUserAction(payload.userId, 'websocket_connected', { 
        clientId: client.id,
        username: payload.username 
      });
      
      // Emit successful connection
      client.emit('authenticated', { 
        message: 'Successfully authenticated',
        user: payload 
      });
      
    } catch (error) {
      this.logger.logAuthenticationFailure(error.message, { clientId: client.id });
      client.emit('error', { 
        code: 'AUTH_FAILED',
        message: error.message || 'Authentication failed' 
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove user from connected users
    if (client.user) {
      this.connectedUsers.delete(client.user.userId);
      console.log(`User ${client.user.username} (${client.user.userId}) disconnected`);
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.user) {
        client.emit('error', { 
          message: 'User not authenticated',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const { conversationId } = data;
      const userId = client.user.userId;
      
      // Validate input
      if (!conversationId) {
        client.emit('error', { 
          message: 'Conversation ID is required',
          code: 'VALIDATION_ERROR'
        });
        return;
      }
      
      // Verify user has access to this conversation
      await this.chatService.verifyUserAccess(conversationId, userId);
      
      // Join the room
      await client.join(`conversation_${conversationId}`);
      
      this.logger.logConversationJoined(userId, conversationId);
      
      // Notify others in the conversation
      client.to(`conversation_${conversationId}`).emit('user_joined', {
        userId,
        username: client.user.username,
        conversationId,
        timestamp: new Date()
      });

      return { 
        success: true, 
        message: 'Successfully joined conversation',
        conversationId,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.logError(error, { 
        userId: client.user?.userId, 
        conversationId: data?.conversationId, 
        action: 'join_conversation' 
      });
      
      client.emit('error', { 
        message: error.message || 'Failed to join conversation',
        code: 'JOIN_CONVERSATION_ERROR'
      });
    }
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.user) {
        throw new Error('User not authenticated');
      }

      const { conversationId } = data;
      const userId = client.user.userId;
      
      // Leave the room
      await client.leave(`conversation_${conversationId}`);
      
      // Notify others in the conversation
      client.to(`conversation_${conversationId}`).emit('user_left', {
        userId,
        username: client.user.username,
        conversationId,
        timestamp: new Date()
      });

      return { success: true, message: 'Left conversation' };
    } catch (error) {
      console.error('Error leaving conversation:', error);
      return { success: false, message: 'Failed to leave conversation' };
    }
  }

  @SubscribeMessage('send_message')
  @UseGuards(RateLimiterGuard)
  async handleSendMessage(
    @MessageBody() data: { conversationId: string; content: string; type?: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.user) {
        client.emit('error', { 
          message: 'User not authenticated',
          code: 'AUTH_REQUIRED'
        });
        return;
      }

      const { conversationId, content, type } = data;
      const senderId = client.user.userId;
      
      // Validate input
      if (!content || !conversationId) {
        client.emit('error', { 
          message: 'Missing required fields',
          code: 'VALIDATION_ERROR'
        });
        return;
      }

      if (content.trim().length === 0) {
        client.emit('error', { 
          message: 'Message content cannot be empty',
          code: 'VALIDATION_ERROR'
        });
        return;
      }
      
      // Verify user has access to this conversation
      await this.chatService.verifyUserAccess(conversationId, senderId);
      
      // Save message to database
      const message = await this.chatService.sendMessage({
        conversationId,
        senderId,
        content: content.trim(),
        type: type as any || 'TEXT'
      });
      
      this.logger.logMessageSent(senderId, conversationId, message.id);
      
      // Broadcast message to all users in the conversation
      this.server.to(`conversation_${conversationId}`).emit('new_message', {
        ...message,
        timestamp: new Date()
      });

      return { success: true, message: 'Message sent', data: message };
    } catch (error) {
      this.logger.logError(error, { 
        senderId: client.user?.userId, 
        conversationId: data?.conversationId, 
        action: 'send_message' 
      });
      
      client.emit('error', { 
        message: error.message || 'Failed to send message',
        code: 'MESSAGE_SEND_ERROR'
      });
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    if (!client.user) {
      return { success: false, message: 'User not authenticated' };
    }

    const { conversationId } = data;
    const userId = client.user.userId;
    
    // Notify others that user is typing
    client.to(`conversation_${conversationId}`).emit('user_typing', {
      userId,
      username: client.user.username,
      conversationId,
      isTyping: true
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    if (!client.user) {
      return { success: false, message: 'User not authenticated' };
    }

    const { conversationId } = data;
    const userId = client.user.userId;
    
    // Notify others that user stopped typing
    client.to(`conversation_${conversationId}`).emit('user_typing', {
      userId,
      username: client.user.username,
      conversationId,
      isTyping: false
    });
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.user) {
        throw new Error('User not authenticated');
      }

      const { messageId } = data;
      const userId = client.user.userId;
      
      // Mark message as read
      const readReceipt = await this.chatService.markMessageAsRead(messageId, userId);
      
      // Get message to find conversation ID
      const message = await this.chatService.getMessageById(messageId);
      
      // Notify others that message was read
      client.to(`conversation_${message.conversationId}`).emit('message_read', {
        userId,
        username: client.user.username,
        conversationId: message.conversationId,
        messageId,
        readAt: readReceipt.readAt,
        timestamp: new Date()
      });

      return { success: true, message: 'Message marked as read', data: readReceipt };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { success: false, message: 'Failed to mark message as read' };
    }
  }

  @SubscribeMessage('mark_conversation_read')
  async handleMarkConversationRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.user) {
        throw new Error('User not authenticated');
      }

      const { conversationId } = data;
      const userId = client.user.userId;
      
      // Verify user has access to this conversation
      await this.chatService.verifyUserAccess(conversationId, userId);
      
      // Mark all messages as read
      const readReceipts = await this.chatService.markConversationAsRead(conversationId, userId);
      
      // Notify others that conversation was read
      client.to(`conversation_${conversationId}`).emit('conversation_read', {
        userId,
        username: client.user.username,
        conversationId,
        readCount: readReceipts.length,
        timestamp: new Date()
      });

      return { success: true, message: 'Conversation marked as read', data: readReceipts };
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      return { success: false, message: 'Failed to mark conversation as read' };
    }
  }
}
