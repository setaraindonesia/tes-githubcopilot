import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    validateUser(username: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    createUser(userData: any): Promise<{
        id: string;
        email: string;
        username: string;
        emailVerified: boolean;
        createdAt: Date;
    }>;
    findUserByUsername(username: string): Promise<{
        id: string;
        email: string;
        username: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: string | null;
        isActive: boolean;
        isVerified: boolean;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findUserByEmail(email: string): Promise<{
        id: string;
        email: string;
        username: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        avatar: string | null;
        isActive: boolean;
        isVerified: boolean;
        emailVerified: boolean;
        emailVerificationToken: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
