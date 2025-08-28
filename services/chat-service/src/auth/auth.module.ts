import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { WsJwtGuard } from './ws-jwt.guard';
import { RateLimiterGuard } from './rate-limiter.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  providers: [AuthService, JwtAuthGuard, WsJwtGuard, RateLimiterGuard],
  exports: [AuthService, JwtAuthGuard, WsJwtGuard, RateLimiterGuard],
})
export class AuthModule {}
