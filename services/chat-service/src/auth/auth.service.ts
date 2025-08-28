import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(userId: string): Promise<any> {
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

  async verifyToken(token: string): Promise<any> {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET not configured');
      }

      const decoded = jwt.verify(token, secret) as any;
      
      if (!decoded.sub) {
        throw new Error('Invalid token payload');
      }

      // Validate user still exists and is active
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
    } catch (error) {
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

  extractTokenFromSocket(client: any): string | null {
    // Try different token extraction methods
    const token = 
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake?.query?.token;
    
    return token || null;
  }
}

