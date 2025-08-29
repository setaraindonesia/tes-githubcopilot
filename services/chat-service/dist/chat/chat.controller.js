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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const chat_dto_1 = require("./dto/chat.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async health() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'chat-service',
            version: '1.0.0',
            database: 'connected'
        };
    }
    async createConversation(createConversationDto, req) {
        if (!createConversationDto.participantIds.includes(req.user.userId)) {
            createConversationDto.participantIds.push(req.user.userId);
        }
        return this.chatService.createConversation(createConversationDto);
    }
    async getUserConversations(req) {
        return this.chatService.getUserConversations(req.user.userId);
    }
    async sendMessage(sendMessageDto, req) {
        sendMessageDto.senderId = req.user.userId;
        return this.chatService.sendMessage(sendMessageDto);
    }
    async getConversationMessages(conversationId, req, limit, offset = '0') {
        const limitNum = limit ? parseInt(limit) : 50;
        const offsetNum = offset ? parseInt(offset) : 0;
        await this.chatService.verifyUserAccess(conversationId, req.user.userId);
        return this.chatService.getConversationMessages(conversationId, limitNum, offsetNum);
    }
    async joinConversation(conversationId, req) {
        return this.chatService.joinConversation({
            conversationId,
            userId: req.user.userId
        });
    }
    async getOnlineUsers() {
        return this.chatService.getOnlineUsers();
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('conversations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.CreateConversationDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserConversations", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/messages'),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversationMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:conversationId/join'),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "joinConversation", null);
__decorate([
    (0, common_1.Get)('users/online'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getOnlineUsers", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map