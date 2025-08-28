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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthController = class AuthController {
    constructor(authService, prisma) {
        this.authService = authService;
        this.prisma = prisma;
    }
    async register(registerDto) {
        try {
            const existingUserByUsername = await this.prisma.user.findUnique({
                where: { username: registerDto.username }
            });
            if (existingUserByUsername) {
                throw new common_1.ConflictException('Username sudah digunakan');
            }
            const existingUserByEmail = await this.prisma.user.findUnique({
                where: { email: registerDto.email }
            });
            if (existingUserByEmail) {
                throw new common_1.ConflictException('Email sudah digunakan');
            }
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            const emailVerificationToken = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            const user = await this.prisma.user.create({
                data: {
                    username: registerDto.username,
                    email: registerDto.email,
                    password: hashedPassword,
                    emailVerificationToken,
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    emailVerified: true,
                    createdAt: true,
                }
            });
            return {
                message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    emailVerified: user.emailVerified
                }
            };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.HttpException('Terjadi kesalahan saat registrasi', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(loginDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { username: loginDto.username }
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Username atau password salah');
            }
            if (!user.isActive) {
                throw new common_1.UnauthorizedException('Akun Anda telah dinonaktifkan');
            }
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Username atau password salah');
            }
            const token = jwt.sign({
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }, process.env.JWT_SECRET || 'your-super-secret-jwt-key', { expiresIn: '7d' });
            await this.prisma.session.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                }
            });
            return {
                message: 'Login berhasil',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    role: user.role
                }
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.HttpException('Terjadi kesalahan saat login', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyEmail(verifyEmailDto) {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    emailVerificationToken: verifyEmailDto.token,
                    emailVerified: false
                }
            });
            if (!user) {
                throw new common_1.NotFoundException('Token verifikasi tidak valid atau sudah digunakan');
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    emailVerificationToken: null,
                }
            });
            return {
                message: 'Email berhasil diverifikasi!'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.HttpException('Terjadi kesalahan saat verifikasi email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resendVerification(body) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: body.email }
            });
            if (!user) {
                throw new common_1.NotFoundException('Email tidak ditemukan');
            }
            if (user.emailVerified) {
                throw new common_1.ConflictException('Email sudah diverifikasi');
            }
            const emailVerificationToken = Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { emailVerificationToken }
            });
            return {
                message: 'Email verifikasi telah dikirim ulang'
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.HttpException('Terjadi kesalahan saat mengirim email verifikasi', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkUsername(username) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { username },
                select: { username: true }
            });
            return {
                available: !user,
                message: user ? 'Username sudah digunakan' : 'Username tersedia'
            };
        }
        catch (error) {
            throw new common_1.HttpException('Terjadi kesalahan saat mengecek username', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkEmail(email) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
                select: { email: true }
            });
            return {
                available: !user,
                message: user ? 'Email sudah digunakan' : 'Email tersedia'
            };
        }
        catch (error) {
            throw new common_1.HttpException('Terjadi kesalahan saat mengecek email', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Get)('check-username/:username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkUsername", null);
__decorate([
    (0, common_1.Get)('check-email/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkEmail", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map