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
exports.GetMessagesDto = exports.JoinConversationDto = exports.SendMessageDto = exports.CreateConversationDto = exports.MessageType = exports.ConversationType = void 0;
const class_validator_1 = require("class-validator");
var ConversationType;
(function (ConversationType) {
    ConversationType["DIRECT"] = "DIRECT";
    ConversationType["GROUP"] = "GROUP";
})(ConversationType || (exports.ConversationType = ConversationType = {}));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["FILE"] = "FILE";
    MessageType["AUDIO"] = "AUDIO";
    MessageType["VIDEO"] = "VIDEO";
})(MessageType || (exports.MessageType = MessageType = {}));
class CreateConversationDto {
}
exports.CreateConversationDto = CreateConversationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ConversationType),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateConversationDto.prototype, "participantIds", void 0);
class SendMessageDto {
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], SendMessageDto.prototype, "conversationId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], SendMessageDto.prototype, "senderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(MessageType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "type", void 0);
class JoinConversationDto {
}
exports.JoinConversationDto = JoinConversationDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], JoinConversationDto.prototype, "conversationId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], JoinConversationDto.prototype, "userId", void 0);
class GetMessagesDto {
}
exports.GetMessagesDto = GetMessagesDto;
__decorate([
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], GetMessagesDto.prototype, "conversationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetMessagesDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GetMessagesDto.prototype, "offset", void 0);
//# sourceMappingURL=chat.dto.js.map