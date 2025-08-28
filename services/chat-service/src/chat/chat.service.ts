import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto, SendMessageDto, JoinConversationDto } from './dto/chat.dto';
import { ChatLoggerService } from '../common/logger.service';
import { 
  ConversationNotFoundException, 
  MessageNotFoundException, 
  UserNotInConversationException 
} from '../common/exceptions';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private logger: ChatLoggerService
  ) {}

  // Create new conversation
  async createConversation(data: CreateConversationDto) {
    const { name, type, participantIds } = data;
    
    const conversation = await this.prisma.conversation.create({
      data: {
        name,
        type,
        participants: {
          create: participantIds.map(userId => ({
            userId,
            role: 'MEMBER'
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return conversation;
  }

  // Get user conversations
  async getUserConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return conversations;
  }

  // Send message
  async sendMessage(data: SendMessageDto) {
    try {
      const { conversationId, senderId, content, type = 'TEXT' } = data;

      // Verify conversation exists
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      if (!conversation) {
        throw new ConversationNotFoundException(conversationId);
      }

      const message = await this.prisma.message.create({
        data: {
          conversationId,
          senderId,
          content,
          type
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        }
      });

      // Update conversation updatedAt
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      this.logger.logMessageSent(senderId, conversationId, message.id);
      return message;
    } catch (error) {
      this.logger.logError(error, { action: 'send_message', metadata: data });
      throw error;
    }
  }

  // Get conversation messages
  async getConversationMessages(conversationId: string, limit = 50, offset = 0) {
    try {
      // Verify conversation exists
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId }
      });

      if (!conversation) {
        throw new ConversationNotFoundException(conversationId);
      }

      const messages = await this.prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      this.logger.logError(error, { action: 'get_conversation_messages', conversationId });
      throw error;
    }
  }

  // Join conversation
  async joinConversation(data: JoinConversationDto) {
    const { conversationId, userId } = data;

    const existingParticipant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    const participant = await this.prisma.conversationParticipant.create({
      data: {
        conversationId,
        userId,
        role: 'MEMBER'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return participant;
  }

  // Verify user has access to conversation
  async verifyUserAccess(conversationId: string, userId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participant) {
      this.logger.warn('User access denied to conversation', { 
        userId, 
        conversationId, 
        action: 'access_denied' 
      });
      throw new UserNotInConversationException(userId, conversationId);
    }

    return participant;
  }

  // Get message by ID
  async getMessageById(messageId: string) {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          type: true,
          createdAt: true
        }
      });

      if (!message) {
        throw new MessageNotFoundException(messageId);
      }

      return message;
    } catch (error) {
      this.logger.logError(error, { action: 'get_message_by_id', messageId });
      throw error;
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId: string, userId: string) {
    try {
      // Verify message exists
      const message = await this.prisma.message.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        throw new MessageNotFoundException(messageId);
      }

      const existingReceipt = await this.prisma.messageReadReceipt.findUnique({
        where: {
          messageId_userId: {
            messageId,
            userId
          }
        }
      });

      if (existingReceipt) {
        return existingReceipt;
      }

      const readReceipt = await this.prisma.messageReadReceipt.create({
        data: {
          messageId,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          message: {
            select: {
              id: true,
              conversationId: true
            }
          }
        }
      });

      return readReceipt;
    } catch (error) {
      this.logger.logError(error, { action: 'mark_message_as_read', messageId, userId });
      throw error;
    }
  }

  // Mark all messages in conversation as read
  async markConversationAsRead(conversationId: string, userId: string) {
    // Get all unread messages in conversation
    const unreadMessages = await this.prisma.message.findMany({
      where: {
        conversationId,
        NOT: {
          senderId: userId // Don't mark own messages as read
        },
        readReceipts: {
          none: {
            userId
          }
        }
      },
      select: {
        id: true
      }
    });

    // Create read receipts for all unread messages
    const readReceipts = await Promise.all(
      unreadMessages.map(message =>
        this.prisma.messageReadReceipt.create({
          data: {
            messageId: message.id,
            userId
          }
        })
      )
    );

    return readReceipts;
  }

  // Get online users
  async getOnlineUsers() {
    // This would typically integrate with Redis or WebSocket connections
    // For now, return all active users
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true
      }
    });

    return users;
  }
}
