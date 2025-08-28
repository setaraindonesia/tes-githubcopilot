import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto, JoinConversationDto, GetMessagesDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('health')
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'chat-service',
      version: '1.0.0',
      database: 'connected'
    };
  }

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req: any
  ) {
    // Ensure current user is included in participants
    if (!createConversationDto.participantIds.includes(req.user.userId)) {
      createConversationDto.participantIds.push(req.user.userId);
    }
    return this.chatService.createConversation(createConversationDto);
  }

  @Get('conversations')
  async getUserConversations(@Request() req: any) {
    // Use authenticated user's ID instead of URL param
    return this.chatService.getUserConversations(req.user.userId);
  }

  @Post('messages')
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req: any) {
    // Ensure sender is the authenticated user
    sendMessageDto.senderId = req.user.userId;
    return this.chatService.sendMessage(sendMessageDto);
  }

  @Get('conversations/:conversationId/messages')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset: string = '0'
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    
    // Verify user has access to this conversation
    await this.chatService.verifyUserAccess(conversationId, req.user.userId);
    
    return this.chatService.getConversationMessages(conversationId, limitNum, offsetNum);
  }

  @Post('conversations/:conversationId/join')
  async joinConversation(
    @Param('conversationId') conversationId: string,
    @Request() req: any
  ) {
    // Use authenticated user's ID
    return this.chatService.joinConversation({
      conversationId,
      userId: req.user.userId
    });
  }

  @Get('users/online')
  async getOnlineUsers() {
    return this.chatService.getOnlineUsers();
  }
}
