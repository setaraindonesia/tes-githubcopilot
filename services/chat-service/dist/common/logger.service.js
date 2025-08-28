"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatLoggerService = void 0;
const common_1 = require("@nestjs/common");
let ChatLoggerService = class ChatLoggerService {
    formatMessage(message, context) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
        return `${timestamp} - ${message}${contextStr}`;
    }
    log(message, context) {
        console.log(`[INFO] ${this.formatMessage(message, context)}`);
    }
    error(message, trace, context) {
        console.error(`[ERROR] ${this.formatMessage(message, context)}`);
        if (trace) {
            console.error(`[TRACE] ${trace}`);
        }
    }
    warn(message, context) {
        console.warn(`[WARN] ${this.formatMessage(message, context)}`);
    }
    debug(message, context) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${this.formatMessage(message, context)}`);
        }
    }
    verbose(message, context) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[VERBOSE] ${this.formatMessage(message, context)}`);
        }
    }
    logUserAction(userId, action, metadata) {
        this.log(`User action: ${action}`, { userId, action, metadata });
    }
    logMessageSent(userId, conversationId, messageId) {
        this.log('Message sent', { userId, conversationId, messageId, action: 'send_message' });
    }
    logConversationJoined(userId, conversationId) {
        this.log('User joined conversation', { userId, conversationId, action: 'join_conversation' });
    }
    logAuthenticationFailure(reason, metadata) {
        this.warn(`Authentication failed: ${reason}`, { action: 'auth_failure', metadata });
    }
    logRateLimitExceeded(userId, action) {
        this.warn('Rate limit exceeded', { userId, action: 'rate_limit_exceeded', metadata: { exceededAction: action } });
    }
    logError(error, context) {
        this.error(error.message, error.stack, { ...context, action: 'error_occurred' });
    }
};
exports.ChatLoggerService = ChatLoggerService;
exports.ChatLoggerService = ChatLoggerService = __decorate([
    (0, common_1.Injectable)()
], ChatLoggerService);
//# sourceMappingURL=logger.service.js.map