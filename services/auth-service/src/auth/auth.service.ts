import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username }
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      username: user.username, 
      sub: user.id,
      email: user.email,
      role: user.role 
    };
    
    return {
      access_token: jwt.sign(payload, process.env.JWT_SECRET || 'your-super-secret-jwt-key'),
    };
  }

  async createUser(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      }
    });
  }

  async findUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username }
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email }
    });
  }
}
