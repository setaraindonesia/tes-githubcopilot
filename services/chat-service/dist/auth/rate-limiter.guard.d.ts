import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ChatLoggerService } from '../common/logger.service';
export declare class RateLimiterGuard implements CanActivate {
    private logger;
    constructor(logger: ChatLoggerService);
    private userMessageCounts;
    private readonly maxMessages;
    private readonly windowMs;
    canActivate(context: ExecutionContext): boolean;
    private cleanupExpiredEntries;
}
