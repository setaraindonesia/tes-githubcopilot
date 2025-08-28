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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const logger_service_1 = require("../common/logger.service");
const exceptions_1 = require("../common/exceptions");
let ChatService = class ChatService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    async createConversation(data) {
        const { name, type, participantIds } = data;
        const conversation = await this.prisma.conversation.create({
            data: {
                name,
                type,
                participants: {
                    create: participantIds.map(userId => ({
                        userId,
                        role: 'MEMBER'
                    }))
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });
        return conversation;
    }
    async getUserConversations(userId) {
        const conversations = await this.prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return conversations;
    }
    async sendMessage(data) {
        try {
            const { conversationId, senderId, content, type = 'TEXT' } = data;
            const conversation = await this.prisma.conversation.findUnique({
                where: { id: conversationId }
            });
            if (!conversation) {
                throw new exceptions_1.ConversationNotFoundException(conversationId);
            }
            const message = await this.prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    content,
                    type
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            });
            await this.prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() }
            });
            this.logger.logMessageSent(senderId, conversationId, message.id);
            return message;
        }
        catch (error) {
            this.logger.logError(error, { action: 'send_message', metadata: data });
            throw error;
        }
    }
    async getConversationMessages(conversationId, limit = 50, offset = 0) {
        try {
            const conversation = await this.prisma.conversation.findUnique({
                where: { id: conversationId }
            });
            if (!conversation) {
                throw new exceptions_1.ConversationNotFoundException(conversationId);
            }
            const messages = await this.prisma.message.findMany({
                where: { conversationId },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            });
            return messages.reverse();
        }
        catch (error) {
            this.logger.logError(error, { action: 'get_conversation_messages', conversationId });
            throw error;
        }
    }
    async joinConversation(data) {
        const { conversationId, userId } = data;
        const existingParticipant = await this.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            }
        });
        if (existingParticipant) {
            return existingParticipant;
        }
        const participant = await this.prisma.conversationParticipant.create({
            data: {
                conversationId,
                userId,
                role: 'MEMBER'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });
        return participant;
    }
    async verifyUserAccess(conversationId, userId) {
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId
                }
            }
        });
        if (!participant) {
            this.logger.warn('User access denied to conversation', {
                userId,
                conversationId,
                action: 'access_denied'
            });
            throw new exceptions_1.UserNotInConversationException(userId, conversationId);
        }
        return participant;
    }
    async getMessageById(messageId) {
        try {
            const message = await this.prisma.message.findUnique({
                where: { id: messageId },
                select: {
                    id: true,
                    conversationId: true,
                    senderId: true,
                    content: true,
                    type: true,
                    createdAt: true
                }
            });
            if (!message) {
                throw new exceptions_1.MessageNotFoundException(messageId);
            }
            return message;
        }
        catch (error) {
            this.logger.logError(error, { action: 'get_message_by_id', messageId });
            throw error;
        }
    }
    async markMessageAsRead(messageId, userId) {
        try {
            const message = await this.prisma.message.findUnique({
                where: { id: messageId }
            });
            if (!message) {
                throw new exceptions_1.MessageNotFoundException(messageId);
            }
            const existingReceipt = await this.prisma.messageReadReceipt.findUnique({
                where: {
                    messageId_userId: {
                        messageId,
                        userId
                    }
                }
            });
            if (existingReceipt) {
                return existingReceipt;
            }
            const readReceipt = await this.prisma.messageReadReceipt.create({
                data: {
                    messageId,
                    userId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    },
                    message: {
                        select: {
                            id: true,
                            conversationId: true
                        }
                    }
                }
            });
            return readReceipt;
        }
        catch (error) {
            this.logger.logError(error, { action: 'mark_message_as_read', messageId, userId });
            throw error;
        }
    }
    async markConversationAsRead(conversationId, userId) {
        const unreadMessages = await this.prisma.message.findMany({
            where: {
                conversationId,
                NOT: {
                    senderId: userId
                },
                readReceipts: {
                    none: {
                        userId
                    }
                }
            },
            select: {
                id: true
            }
        });
        const readReceipts = await Promise.all(unreadMessages.map(message => this.prisma.messageReadReceipt.create({
            data: {
                messageId: message.id,
                userId
            }
        })));
        return readReceipts;
    }
    async getOnlineUsers() {
        const users = await this.prisma.user.findMany({
            where: { isActive: true },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true
            }
        });
        return users;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logger_service_1.ChatLoggerService])
], ChatService);
//# sourceMappingURL=chat.service.js.map