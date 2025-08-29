"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const auth_service_1 = require("../auth/auth.service");
const rate_limiter_guard_1 = require("../auth/rate-limiter.guard");
const logger_service_1 = require("../common/logger.service");
let ChatGateway = class ChatGateway {
    constructor(chatService, authService, logger) {
        this.chatService = chatService;
        this.authService = authService;
        this.logger = logger;
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        this.logger.debug(`Client connected: ${client.id}`);
        try {
            const token = this.authService.extractTokenFromSocket(client);
            if (!token) {
                if (process.env.NODE_ENV === 'development') {
                    client.user = {
                        userId: `test_user_${client.id}`,
                        username: `testuser_${client.id.substring(0, 4)}`,
                        email: `test_${client.id}@test.com`,
                        role: 'USER'
                    };
                    this.connectedUsers.set(client.user.userId, client);
                    this.logger.logUserAction(client.user.userId, 'websocket_connected_dev', {
                        clientId: client.id,
                        username: client.user.username
                    });
                    client.emit('authenticated', {
                        message: 'Successfully authenticated (dev mode)',
                        user: client.user
                    });
                    return;
                }
                this.logger.logAuthenticationFailure('No token provided', { clientId: client.id });
                client.emit('error', {
                    code: 'AUTH_REQUIRED',
                    message: 'Authentication token required'
                });
                client.disconnect();
                return;
            }
            const payload = await this.authService.verifyToken(token);
            client.user = payload;
            this.connectedUsers.set(payload.userId, client);
            this.logger.logUserAction(payload.userId, 'websocket_connected', {
                clientId: client.id,
                username: payload.username
            });
            client.emit('authenticated', {
                message: 'Successfully authenticated',
                user: payload
            });
        }
        catch (error) {
            this.logger.logAuthenticationFailure(error.message, { clientId: client.id });
            client.emit('error', {
                code: 'AUTH_FAILED',
                message: error.message || 'Authentication failed'
            });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        if (client.user) {
            this.connectedUsers.delete(client.user.userId);
            console.log(`User ${client.user.username} (${client.user.userId}) disconnected`);
        }
    }
    async handleJoinConversation(data, client) {
        try {
            if (!client.user) {
                client.emit('error', {
                    message: 'User not authenticated',
                    code: 'AUTH_REQUIRED'
                });
                return;
            }
            const { conversationId } = data;
            const userId = client.user.userId;
            if (!conversationId) {
                client.emit('error', {
                    message: 'Conversation ID is required',
                    code: 'VALIDATION_ERROR'
                });
                return;
            }
            await this.chatService.verifyUserAccess(conversationId, userId);
            await client.join(`conversation_${conversationId}`);
            this.logger.logConversationJoined(userId, conversationId);
            client.to(`conversation_${conversationId}`).emit('user_joined', {
                userId,
                username: client.user.username,
                conversationId,
                timestamp: new Date()
            });
            return {
                success: true,
                message: 'Successfully joined conversation',
                conversationId,
                timestamp: new Date()
            };
        }
        catch (error) {
            this.logger.logError(error, {
                userId: client.user?.userId,
                conversationId: data?.conversationId,
                action: 'join_conversation'
            });
            client.emit('error', {
                message: error.message || 'Failed to join conversation',
                code: 'JOIN_CONVERSATION_ERROR'
            });
        }
    }
    async handleLeaveConversation(data, client) {
        try {
            if (!client.user) {
                throw new Error('User not authenticated');
            }
            const { conversationId } = data;
            const userId = client.user.userId;
            await client.leave(`conversation_${conversationId}`);
            client.to(`conversation_${conversationId}`).emit('user_left', {
                userId,
                username: client.user.username,
                conversationId,
                timestamp: new Date()
            });
            return { success: true, message: 'Left conversation' };
        }
        catch (error) {
            console.error('Error leaving conversation:', error);
            return { success: false, message: 'Failed to leave conversation' };
        }
    }
    async handleSendMessage(data, client) {
        try {
            if (!client.user) {
                client.emit('error', {
                    message: 'User not authenticated',
                    code: 'AUTH_REQUIRED'
                });
                return;
            }
            const { conversationId, content, type } = data;
            const senderId = client.user.userId;
            if (!content || !conversationId) {
                client.emit('error', {
                    message: 'Missing required fields',
                    code: 'VALIDATION_ERROR'
                });
                return;
            }
            if (content.trim().length === 0) {
                client.emit('error', {
                    message: 'Message content cannot be empty',
                    code: 'VALIDATION_ERROR'
                });
                return;
            }
            await this.chatService.verifyUserAccess(conversationId, senderId);
            const message = await this.chatService.sendMessage({
                conversationId,
                senderId,
                content: content.trim(),
                type: type || 'TEXT'
            });
            this.logger.logMessageSent(senderId, conversationId, message.id);
            this.server.to(`conversation_${conversationId}`).emit('new_message', {
                ...message,
                timestamp: new Date()
            });
            return { success: true, message: 'Message sent', data: message };
        }
        catch (error) {
            this.logger.logError(error, {
                senderId: client.user?.userId,
                conversationId: data?.conversationId,
                action: 'send_message'
            });
            client.emit('error', {
                message: error.message || 'Failed to send message',
                code: 'MESSAGE_SEND_ERROR'
            });
        }
    }
    handleTypingStart(data, client) {
        if (!client.user) {
            return { success: false, message: 'User not authenticated' };
        }
        const { conversationId } = data;
        const userId = client.user.userId;
        client.to(`conversation_${conversationId}`).emit('user_typing', {
            userId,
            username: client.user.username,
            conversationId,
            isTyping: true
        });
    }
    handleTypingStop(data, client) {
        if (!client.user) {
            return { success: false, message: 'User not authenticated' };
        }
        const { conversationId } = data;
        const userId = client.user.userId;
        client.to(`conversation_${conversationId}`).emit('user_typing', {
            userId,
            username: client.user.username,
            conversationId,
            isTyping: false
        });
    }
    async handleMarkAsRead(data, client) {
        try {
            if (!client.user) {
                throw new Error('User not authenticated');
            }
            const { messageId } = data;
            const userId = client.user.userId;
            const readReceipt = await this.chatService.markMessageAsRead(messageId, userId);
            const message = await this.chatService.getMessageById(messageId);
            client.to(`conversation_${message.conversationId}`).emit('message_read', {
                userId,
                username: client.user.username,
                conversationId: message.conversationId,
                messageId,
                readAt: readReceipt.readAt,
                timestamp: new Date()
            });
            return { success: true, message: 'Message marked as read', data: readReceipt };
        }
        catch (error) {
            console.error('Error marking message as read:', error);
            return { success: false, message: 'Failed to mark message as read' };
        }
    }
    async handleMarkConversationRead(data, client) {
        try {
            if (!client.user) {
                throw new Error('User not authenticated');
            }
            const { conversationId } = data;
            const userId = client.user.userId;
            await this.chatService.verifyUserAccess(conversationId, userId);
            const readReceipts = await this.chatService.markConversationAsRead(conversationId, userId);
            client.to(`conversation_${conversationId}`).emit('conversation_read', {
                userId,
                username: client.user.username,
                conversationId,
                readCount: readReceipts.length,
                timestamp: new Date()
            });
            return { success: true, message: 'Conversation marked as read', data: readReceipts };
        }
        catch (error) {
            console.error('Error marking conversation as read:', error);
            return { success: false, message: 'Failed to mark conversation as read' };
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    (0, common_1.UseGuards)(rate_limiter_guard_1.RateLimiterGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_start'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_stop'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_as_read'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_conversation_read'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkConversationRead", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || [
                'http://localhost:3000',
                'http://localhost:3001',
                'https://web-5it9deahv-setaraindonesias-projects.vercel.app'
            ],
            credentials: true,
            methods: ['GET', 'POST'],
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        auth_service_1.AuthService,
        logger_service_1.ChatLoggerService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map