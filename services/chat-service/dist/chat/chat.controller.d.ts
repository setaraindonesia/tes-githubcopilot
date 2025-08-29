import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    health(): Promise<{
        status: string;
        timestamp: string;
        service: string;
        version: string;
        database: string;
    }>;
    createConversation(createConversationDto: CreateConversationDto, req: any): Promise<any>;
    getUserConversations(req: any): Promise<any>;
    sendMessage(sendMessageDto: SendMessageDto, req: any): Promise<any>;
    getConversationMessages(conversationId: string, req: any, limit?: string, offset?: string): Promise<any>;
    joinConversation(conversationId: string, req: any): Promise<any>;
    getOnlineUsers(): Promise<any>;
}
