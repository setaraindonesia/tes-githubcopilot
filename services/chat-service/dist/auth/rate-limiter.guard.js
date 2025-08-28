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
exports.RateLimiterGuard = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../common/logger.service");
let RateLimiterGuard = class RateLimiterGuard {
    constructor(logger) {
        this.logger = logger;
        this.userMessageCounts = new Map();
        this.maxMessages = 10;
        this.windowMs = 60 * 1000;
        setInterval(() => this.cleanupExpiredEntries(), 5 * 60 * 1000);
    }
    canActivate(context) {
        try {
            const client = context.switchToWs().getClient();
            if (!client.user) {
                client.emit('error', {
                    message: 'Authentication required for rate limiting',
                    code: 'AUTH_REQUIRED'
                });
                return false;
            }
            const userId = client.user.userId;
            const now = Date.now();
            let userLimit = this.userMessageCounts.get(userId);
            if (!userLimit || now > userLimit.resetTime) {
                userLimit = {
                    count: 0,
                    resetTime: now + this.windowMs
                };
                this.userMessageCounts.set(userId, userLimit);
            }
            if (userLimit.count >= this.maxMessages) {
                this.logger.logRateLimitExceeded(userId, 'send_message');
                client.emit('error', {
                    message: 'Rate limit exceeded. Please slow down.',
                    code: 'RATE_LIMIT_EXCEEDED',
                    resetTime: userLimit.resetTime
                });
                return false;
            }
            userLimit.count++;
            return true;
        }
        catch (error) {
            this.logger.error('Error in rate limiter guard', error.stack);
            return true;
        }
    }
    cleanupExpiredEntries() {
        const now = Date.now();
        for (const [userId, limit] of this.userMessageCounts.entries()) {
            if (now > limit.resetTime) {
                this.userMessageCounts.delete(userId);
            }
        }
    }
};
exports.RateLimiterGuard = RateLimiterGuard;
exports.RateLimiterGuard = RateLimiterGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logger_service_1.ChatLoggerService])
], RateLimiterGuard);
//# sourceMappingURL=rate-limiter.guard.js.map