import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    validateUser(userId: string): Promise<any>;
    verifyToken(token: string): Promise<any>;
    extractTokenFromSocket(client: any): string | null;
}
