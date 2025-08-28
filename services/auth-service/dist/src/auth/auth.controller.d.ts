import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyEmailDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthController {
    private readonly authService;
    private readonly prisma;
    constructor(authService: AuthService, prisma: PrismaService);
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
}
