import { IsString, IsArray, IsOptional, IsEnum, IsUUID } from 'class-validator';

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export class CreateConversationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ConversationType)
  type: ConversationType;

  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];
}

export class SendMessageDto {
  @IsUUID('4')
  conversationId: string;

  @IsUUID('4')
  senderId: string;

  @IsString()
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;
}

export class JoinConversationDto {
  @IsUUID('4')
  conversationId: string;

  @IsUUID('4')
  userId: string;
}

export class GetMessagesDto {
  @IsUUID('4')
  conversationId: string;

  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;
}
