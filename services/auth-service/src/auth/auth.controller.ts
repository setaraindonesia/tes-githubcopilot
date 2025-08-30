import { Controller, Post, Body, Get, Param, Put, UseGuards, HttpException, HttpStatus, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto, VerifyEmailDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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

      // Generate 6-digit numeric verification code
      const emailVerificationToken = (Math.floor(100000 + Math.random() * 900000)).toString();

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

      // Send verification email (non-blocking best-effort)
      await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

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
      // Support login with username OR email using a single identifier field
      const identifier = (loginDto.username || '').trim();
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: identifier },
            { email: identifier },
          ],
        },
      });

      if (!user) {
        throw new UnauthorizedException('Username atau password salah');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
      }

      // If email verification is required, block login until verified
      if (!user.emailVerified && process.env.NODE_ENV === 'production') {
        throw new UnauthorizedException('Email belum diverifikasi');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Username atau password salah');
      }

      // Generate JWT token with proper payload
      const token = jwt.sign(
        { 
          sub: user.id,        // ← CRITICAL: 'sub' field untuk JWT Strategy
          userId: user.id, 
          username: user.username,
          email: user.email,
          role: user.role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
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

      // Generate new 6-digit numeric verification code
      const emailVerificationToken = (Math.floor(100000 + Math.random() * 900000)).toString();

      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerificationToken }
      });

      // Send verification email (non-blocking best-effort)
      await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

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

  // ===== PROTECTED ENDPOINTS =====

  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    try {
      const userProfile = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          emailVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!userProfile) {
        throw new NotFoundException('User tidak ditemukan');
      }

      return {
        message: 'Profile berhasil diambil',
        user: userProfile,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Terjadi kesalahan saat mengambil profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateData: { firstName?: string; lastName?: string; phone?: string }
  ) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          updatedAt: true,
        },
      });

      return {
        message: 'Profile berhasil diupdate',
        user: updatedUser,
      };
    } catch (error) {
      throw new HttpException('Terjadi kesalahan saat update profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: any) {
    try {
      // Invalidate all sessions for this user
      await this.prisma.session.deleteMany({
        where: { userId: user.id },
      });

      return {
        message: 'Logout berhasil',
      };
    } catch (error) {
      throw new HttpException('Terjadi kesalahan saat logout', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    try {
      // Get current user with password
      const currentUser = await this.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!currentUser) {
        throw new NotFoundException('User tidak ditemukan');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(body.currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Password saat ini salah');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(body.newPassword, 10);

      // Update password
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
      });

      // Invalidate all sessions (force re-login)
      await this.prisma.session.deleteMany({
        where: { userId: user.id },
      });

      return {
        message: 'Password berhasil diubah. Silakan login ulang.',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Terjadi kesalahan saat ubah password', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
