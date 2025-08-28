import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ChatLoggerService } from '../common/logger.service';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(private logger: ChatLoggerService) {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanupExpiredEntries(), 5 * 60 * 1000);
  }
  
  private userMessageCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxMessages = 10; // Max messages per minute
  private readonly windowMs = 60 * 1000; // 1 minute

  canActivate(context: ExecutionContext): boolean {
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

      // Get or create user rate limit data
      let userLimit = this.userMessageCounts.get(userId);
      
      if (!userLimit || now > userLimit.resetTime) {
        // Reset or create new window
        userLimit = {
          count: 0,
          resetTime: now + this.windowMs
        };
        this.userMessageCounts.set(userId, userLimit);
      }

      // Check if user has exceeded rate limit
      if (userLimit.count >= this.maxMessages) {
        this.logger.logRateLimitExceeded(userId, 'send_message');
        client.emit('error', { 
          message: 'Rate limit exceeded. Please slow down.',
          code: 'RATE_LIMIT_EXCEEDED',
          resetTime: userLimit.resetTime
        });
        return false;
      }

      // Increment message count
      userLimit.count++;
      
      return true;
    } catch (error) {
      this.logger.error('Error in rate limiter guard', error.stack);
      return true; // Allow request if rate limiter fails
    }
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [userId, limit] of this.userMessageCounts.entries()) {
      if (now > limit.resetTime) {
        this.userMessageCounts.delete(userId);
      }
    }
  }
}
