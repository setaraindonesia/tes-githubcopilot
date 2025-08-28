import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createConversation(createConversationDto: CreateConversationDto, req: any): Promise<{
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
    getUserConversations(req: any): Promise<({
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
    sendMessage(sendMessageDto: SendMessageDto, req: any): Promise<{
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
    getConversationMessages(conversationId: string, req: any, limit?: string, offset?: string): Promise<({
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
    joinConversation(conversationId: string, req: any): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.ParticipantRole;
        joinedAt: Date;
        userId: string;
        conversationId: string;
    }>;
    getOnlineUsers(): Promise<{
        id: string;
        email: string;
        username: string;
        avatar: string;
    }[]>;
}
