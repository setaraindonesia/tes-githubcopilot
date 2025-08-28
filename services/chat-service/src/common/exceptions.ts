import { HttpException, HttpStatus } from '@nestjs/common';

export class ChatException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly code?: string,
    public readonly context?: any
  ) {
    super({
      message,
      error: 'Chat Service Error',
      statusCode: status,
      code,
      context,
      timestamp: new Date().toISOString(),
    }, status);
  }
}

export class AuthenticationException extends ChatException {
  constructor(message: string = 'Authentication failed') {
    super(message, HttpStatus.UNAUTHORIZED, 'AUTH_FAILED');
  }
}

export class AuthorizationException extends ChatException {
  constructor(message: string = 'Access denied') {
    super(message, HttpStatus.FORBIDDEN, 'ACCESS_DENIED');
  }
}

export class RateLimitException extends ChatException {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED');
  }
}

export class ConversationNotFoundException extends ChatException {
  constructor(conversationId: string) {
    super(
      `Conversation not found: ${conversationId}`,
      HttpStatus.NOT_FOUND,
      'CONVERSATION_NOT_FOUND',
      { conversationId }
    );
  }
}

export class MessageNotFoundException extends ChatException {
  constructor(messageId: string) {
    super(
      `Message not found: ${messageId}`,
      HttpStatus.NOT_FOUND,
      'MESSAGE_NOT_FOUND',
      { messageId }
    );
  }
}

export class UserNotInConversationException extends ChatException {
  constructor(userId: string, conversationId: string) {
    super(
      'User is not a participant in this conversation',
      HttpStatus.FORBIDDEN,
      'USER_NOT_IN_CONVERSATION',
      { userId, conversationId }
    );
  }
}

