import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto, SendMessageDto, JoinConversationDto } from './dto/chat.dto';
import { ChatLoggerService } from '../common/logger.service';
export declare class ChatService {
    private prisma;
    private logger;
    constructor(prisma: PrismaService, logger: ChatLoggerService);
    createConversation(data: CreateConversationDto): Promise<{
        participants: ({
            user: {
                id: string;
                email: string;
                username: string;
                avatar: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.ParticipantRole;
            joinedAt: Date;
            userId: string;
            conversationId: string;
        })[];
    } & {
        id: string;
        name: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserConversations(userId: string): Promise<({
        participants: ({
            user: {
                id: string;
                email: string;
                username: string;
                avatar: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.ParticipantRole;
            joinedAt: Date;
            userId: string;
            conversationId: string;
        })[];
        messages: ({
            sender: {
                id: string;
                username: string;
                avatar: string;
            };
        } & {
            id: string;
            type: import(".prisma/client").$Enums.MessageType;
            createdAt: Date;
            conversationId: string;
            senderId: string;
            content: string;
        })[];
    } & {
        id: string;
        name: string | null;
        type: import(".prisma/client").$Enums.ConversationType;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    sendMessage(data: SendMessageDto): Promise<{
        sender: {
            id: string;
            username: string;
            avatar: string;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.MessageType;
        createdAt: Date;
        conversationId: string;
        senderId: string;
        content: string;
    }>;
    getConversationMessages(conversationId: string, limit?: number, offset?: number): Promise<({
        sender: {
            id: string;
            username: string;
            avatar: string;
        };
    } & {
        id: string;
        type: import(".prisma/client").$Enums.MessageType;
        createdAt: Date;
        conversationId: string;
        senderId: string;
        content: string;
    })[]>;
    joinConversation(data: JoinConversationDto): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        joinedAt: Date;
        userId: string;
        conversationId: string;
    }>;
    verifyUserAccess(conversationId: string, userId: string): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        joinedAt: Date;
        userId: string;
        conversationId: string;
    }>;
    getMessageById(messageId: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.MessageType;
        createdAt: Date;
        conversationId: string;
        senderId: string;
        content: string;
    }>;
    markMessageAsRead(messageId: string, userId: string): Promise<{
        id: string;
        userId: string;
        messageId: string;
        readAt: Date;
    }>;
    markConversationAsRead(conversationId: string, userId: string): Promise<{
        id: string;
        userId: string;
        messageId: string;
        readAt: Date;
    }[]>;
    getOnlineUsers(): Promise<{
        id: string;
        email: string;
        username: string;
        avatar: string;
    }[]>;
}
