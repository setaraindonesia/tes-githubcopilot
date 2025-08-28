import { HttpException, HttpStatus } from '@nestjs/common';
export declare class ChatException extends HttpException {
    readonly code?: string;
    readonly context?: any;
    constructor(message: string, status?: HttpStatus, code?: string, context?: any);
}
export declare class AuthenticationException extends ChatException {
    constructor(message?: string);
}
export declare class AuthorizationException extends ChatException {
    constructor(message?: string);
}
export declare class RateLimitException extends ChatException {
    constructor(message?: string);
}
export declare class ConversationNotFoundException extends ChatException {
    constructor(conversationId: string);
}
export declare class MessageNotFoundException extends ChatException {
    constructor(messageId: string);
}
export declare class UserNotInConversationException extends ChatException {
    constructor(userId: string, conversationId: string);
}
