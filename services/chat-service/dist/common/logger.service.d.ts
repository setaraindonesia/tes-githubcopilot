import { LoggerService } from '@nestjs/common';
export interface LogContext {
    userId?: string;
    senderId?: string;
    conversationId?: string;
    messageId?: string;
    action?: string;
    metadata?: any;
}
export declare class ChatLoggerService implements LoggerService {
    private formatMessage;
    log(message: string, context?: LogContext): void;
    error(message: string, trace?: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    verbose(message: string, context?: LogContext): void;
    logUserAction(userId: string, action: string, metadata?: any): void;
    logMessageSent(userId: string, conversationId: string, messageId: string): void;
    logConversationJoined(userId: string, conversationId: string): void;
    logAuthenticationFailure(reason: string, metadata?: any): void;
    logRateLimitExceeded(userId: string, action: string): void;
    logError(error: Error, context?: LogContext): void;
}
