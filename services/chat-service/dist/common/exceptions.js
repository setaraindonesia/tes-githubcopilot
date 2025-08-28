"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotInConversationException = exports.MessageNotFoundException = exports.ConversationNotFoundException = exports.RateLimitException = exports.AuthorizationException = exports.AuthenticationException = exports.ChatException = void 0;
const common_1 = require("@nestjs/common");
class ChatException extends common_1.HttpException {
    constructor(message, status = common_1.HttpStatus.BAD_REQUEST, code, context) {
        super({
            message,
            error: 'Chat Service Error',
            statusCode: status,
            code,
            context,
            timestamp: new Date().toISOString(),
        }, status);
        this.code = code;
        this.context = context;
    }
}
exports.ChatException = ChatException;
class AuthenticationException extends ChatException {
    constructor(message = 'Authentication failed') {
        super(message, common_1.HttpStatus.UNAUTHORIZED, 'AUTH_FAILED');
    }
}
exports.AuthenticationException = AuthenticationException;
class AuthorizationException extends ChatException {
    constructor(message = 'Access denied') {
        super(message, common_1.HttpStatus.FORBIDDEN, 'ACCESS_DENIED');
    }
}
exports.AuthorizationException = AuthorizationException;
class RateLimitException extends ChatException {
    constructor(message = 'Rate limit exceeded') {
        super(message, common_1.HttpStatus.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED');
    }
}
exports.RateLimitException = RateLimitException;
class ConversationNotFoundException extends ChatException {
    constructor(conversationId) {
        super(`Conversation not found: ${conversationId}`, common_1.HttpStatus.NOT_FOUND, 'CONVERSATION_NOT_FOUND', { conversationId });
    }
}
exports.ConversationNotFoundException = ConversationNotFoundException;
class MessageNotFoundException extends ChatException {
    constructor(messageId) {
        super(`Message not found: ${messageId}`, common_1.HttpStatus.NOT_FOUND, 'MESSAGE_NOT_FOUND', { messageId });
    }
}
exports.MessageNotFoundException = MessageNotFoundException;
class UserNotInConversationException extends ChatException {
    constructor(userId, conversationId) {
        super('User is not a participant in this conversation', common_1.HttpStatus.FORBIDDEN, 'USER_NOT_IN_CONVERSATION', { userId, conversationId });
    }
}
exports.UserNotInConversationException = UserNotInConversationException;
//# sourceMappingURL=exceptions.js.map