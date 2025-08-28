import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyEmailDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      // Check if username already exists
      const existingUserByUsername = await this.prisma.user.findUnique({
        where: { username: registerDto.username }
      });

      if (existingUserByUsername) {
        throw new ConflictException('Username sudah digunakan');
      }

      // Check if email already exists
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: registerDto.email }
      });

      if (existingUserByEmail) {
        throw new ConflictException('Email sudah digunakan');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Generate email verification token
      const emailVerificationToken = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15);

      // Create user
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

      // TODO: Send verification email
      // await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

      return {
        message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified
        }
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException('Terjadi kesalahan saat registrasi', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      // Find user by username
      const user = await this.prisma.user.findUnique({
        where: { username: loginDto.username }
      });

      if (!user) {
        throw new UnauthorizedException('Username atau password salah');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Username atau password salah');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key',
        { expiresIn: '7d' }
      );

      // Create session
      await this.prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new HttpException('Terjadi kesalahan saat login', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { 
          emailVerificationToken: verifyEmailDto.token,
          emailVerified: false
        }
      });

      if (!user) {
        throw new NotFoundException('Token verifikasi tidak valid atau sudah digunakan');
      }

      // Update user email verification status
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Terjadi kesalahan saat verifikasi email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: body.email }
      });

      if (!user) {
        throw new NotFoundException('Email tidak ditemukan');
      }

      if (user.emailVerified) {
        throw new ConflictException('Email sudah diverifikasi');
      }

      // Generate new verification token
      const emailVerificationToken = Math.random().toString(36).substring(2, 15) + 
                                   Math.random().toString(36).substring(2, 15);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerificationToken }
      });

      // TODO: Send verification email
      // await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

      return {
        message: 'Email verifikasi telah dikirim ulang'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException('Terjadi kesalahan saat mengirim email verifikasi', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
        select: { username: true }
      });

      return {
        available: !user,
        message: user ? 'Username sudah digunakan' : 'Username tersedia'
      };
    } catch (error) {
      throw new HttpException('Terjadi kesalahan saat mengecek username', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('check-email/:email')
  async checkEmail(@Param('email') email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { email: true }
      });

      return {
        available: !user,
        message: user ? 'Email sudah digunakan' : 'Email tersedia'
      };
    } catch (error) {
      throw new HttpException('Terjadi kesalahan saat mengecek email', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
