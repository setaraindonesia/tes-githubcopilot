import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto, VerifyEmailDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthController {
    private readonly authService;
    private readonly prisma;
    private readonly emailService;
    constructor(authService: AuthService, prisma: PrismaService, emailService: EmailService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            username: string;
            email: string;
            emailVerified: boolean;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        token: string;
        user: {
            id: string;
            username: string;
            email: string;
            emailVerified: boolean;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    resendVerification(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    checkUsername(username: string): Promise<{
        available: boolean;
        message: string;
    }>;
    checkEmail(email: string): Promise<{
        available: boolean;
        message: string;
    }>;
    healthCheck(): Promise<{
        status: string;
        service: string;
        timestamp: string;
        uptime: number;
    }>;
    getProfile(user: any): Promise<{
        message: string;
        user: {
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            id: string;
            avatar: string;
            emailVerified: boolean;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updateProfile(user: any, updateData: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): Promise<{
        message: string;
        user: {
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            id: string;
            avatar: string;
            updatedAt: Date;
        };
    }>;
    logout(user: any): Promise<{
        message: string;
    }>;
    changePassword(user: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
