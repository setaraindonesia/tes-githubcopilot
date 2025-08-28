import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
interface AuthenticatedSocket extends Socket {
    user?: {
        userId: string;
        username: string;
        email: string;
    };
}
import { AuthService } from '../auth/auth.service';
import { ChatLoggerService } from '../common/logger.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly authService;
    private readonly logger;
    server: Server;
    private connectedUsers;
    constructor(chatService: ChatService, authService: AuthService, logger: ChatLoggerService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleJoinConversation(data: {
        conversationId: string;
    }, client: AuthenticatedSocket): Promise<{
        success: boolean;
        message: string;
        conversationId: string;
        timestamp: Date;
    }>;
    handleLeaveConversation(data: {
        conversationId: string;
    }, client: AuthenticatedSocket): Promise<{
        success: boolean;
        message: string;
    }>;
    handleSendMessage(data: {
        conversationId: string;
        content: string;
        type?: string;
    }, client: AuthenticatedSocket): Promise<{
        success: boolean;
        message: string;
        data: {
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
        };
    }>;
    handleTypingStart(data: {
        conversationId: string;
    }, client: AuthenticatedSocket): {
        success: boolean;
        message: string;
    };
    handleTypingStop(data: {
        conversationId: string;
    }, client: AuthenticatedSocket): {
        success: boolean;
        message: string;
    };
    handleMarkAsRead(data: {
        messageId: string;
    }, client: AuthenticatedSocket): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            userId: string;
            messageId: string;
            readAt: Date;
        };
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    handleMarkConversationRead(data: {
        conversationId: string;
    }, client: AuthenticatedSocket): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            userId: string;
            messageId: string;
            readAt: Date;
        }[];
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
}
export {};
