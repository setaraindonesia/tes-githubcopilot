import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto, SendMessageDto, JoinConversationDto } from './dto/chat.dto';
import { ChatLoggerService } from '../common/logger.service';
export declare class ChatService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService, logger: ChatLoggerService);
    createConversation(data: CreateConversationDto): Promise<any>;
    getUserConversations(userId: string): Promise<any>;
    sendMessage(data: SendMessageDto): Promise<any>;
    getConversationMessages(conversationId: string, limit?: number, offset?: number): Promise<any>;
    joinConversation(data: JoinConversationDto): Promise<any>;
    verifyUserAccess(conversationId: string, userId: string): Promise<any>;
    getMessageById(messageId: string): Promise<any>;
    markMessageAsRead(messageId: string, userId: string): Promise<any>;
    markConversationAsRead(conversationId: string, userId: string): Promise<any[]>;
    getOnlineUsers(): Promise<any>;
}
