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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt = require("jsonwebtoken");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true,
            }
        });
        if (user && user.isActive) {
            return user;
        }
        return null;
    }
    async verifyToken(token) {
        try {
            if (!token) {
                throw new Error('No token provided');
            }
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET not configured');
            }
            const decoded = jwt.verify(token, secret);
            if (!decoded.sub) {
                throw new Error('Invalid token payload');
            }
            const user = await this.validateUser(decoded.sub);
            if (!user) {
                throw new Error('User not found or inactive');
            }
            return {
                userId: decoded.sub,
                username: decoded.username || user.username,
                email: decoded.email || user.email,
                role: decoded.role || user.role,
            };
        }
        catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token format');
            }
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token has expired');
            }
            if (error.name === 'NotBeforeError') {
                throw new Error('Token not active yet');
            }
            throw new Error(error.message || 'Token verification failed');
        }
    }
    extractTokenFromSocket(client) {
        const token = client.handshake?.auth?.token ||
            client.handshake?.headers?.authorization?.replace('Bearer ', '') ||
            client.handshake?.query?.token;
        return token || null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map