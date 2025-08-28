import { Injectable, LoggerService } from '@nestjs/common';

export interface LogContext {
  userId?: string;
  senderId?: string;
  conversationId?: string;
  messageId?: string;
  action?: string;
  metadata?: any;
}

@Injectable()
export class ChatLoggerService implements LoggerService {
  private formatMessage(message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    return `${timestamp} - ${message}${contextStr}`;
  }

  log(message: string, context?: LogContext): void {
    console.log(`[INFO] ${this.formatMessage(message, context)}`);
  }

  error(message: string, trace?: string, context?: LogContext): void {
    console.error(`[ERROR] ${this.formatMessage(message, context)}`);
    if (trace) {
      console.error(`[TRACE] ${trace}`);
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${this.formatMessage(message, context)}`);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${this.formatMessage(message, context)}`);
    }
  }

  verbose(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[VERBOSE] ${this.formatMessage(message, context)}`);
    }
  }

  // Chat-specific logging methods
  logUserAction(userId: string, action: string, metadata?: any): void {
    this.log(`User action: ${action}`, { userId, action, metadata });
  }

  logMessageSent(userId: string, conversationId: string, messageId: string): void {
    this.log('Message sent', { userId, conversationId, messageId, action: 'send_message' });
  }

  logConversationJoined(userId: string, conversationId: string): void {
    this.log('User joined conversation', { userId, conversationId, action: 'join_conversation' });
  }

  logAuthenticationFailure(reason: string, metadata?: any): void {
    this.warn(`Authentication failed: ${reason}`, { action: 'auth_failure', metadata });
  }

  logRateLimitExceeded(userId: string, action: string): void {
    this.warn('Rate limit exceeded', { userId, action: 'rate_limit_exceeded', metadata: { exceededAction: action } });
  }

  logError(error: Error, context?: LogContext): void {
    this.error(error.message, error.stack, { ...context, action: 'error_occurred' });
  }
}
