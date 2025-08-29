import { Module } from '@nestjs/common';
import { ChatLoggerService } from './logger.service';

@Module({
  providers: [ChatLoggerService],
  exports: [ChatLoggerService],
})
export class CommonModule {}


