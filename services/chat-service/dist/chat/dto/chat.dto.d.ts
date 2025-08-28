export declare enum ConversationType {
    DIRECT = "DIRECT",
    GROUP = "GROUP"
}
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    FILE = "FILE",
    AUDIO = "AUDIO",
    VIDEO = "VIDEO"
}
export declare class CreateConversationDto {
    name?: string;
    type: ConversationType;
    participantIds: string[];
}
export declare class SendMessageDto {
    conversationId: string;
    senderId: string;
    content: string;
    type?: MessageType;
}
export declare class JoinConversationDto {
    conversationId: string;
    userId: string;
}
export declare class GetMessagesDto {
    conversationId: string;
    limit?: number;
    offset?: number;
}
