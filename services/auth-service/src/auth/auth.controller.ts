import { Controller, Post, Body, Get, Param, Put, UseGuards, HttpException, HttpStatus, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

// Import bcrypt with better error handling
let bcrypt: any;
try {
  bcrypt = require('bcrypt');
} catch (error) {
  console.error('Failed to load bcrypt:', error);
  throw new Error('bcrypt is required for password hashing');
}

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
        // If email not verified yet, allow resend verification
        if (!existingUserByEmail.emailVerified) {
          // Generate new OTP and resend
          const emailVerificationToken = (Math.floor(100000 + Math.random() * 900000)).toString();
          
          await this.prisma.user.update({
            where: { id: existingUserByEmail.id },
            data: { emailVerificationToken }
          });

          // Send verification email
          await this.emailService.sendVerificationEmail(existingUserByEmail.email, emailVerificationToken);

          return {
            message: 'Email sudah terdaftar tapi belum diverifikasi. Kode verifikasi baru telah dikirim ke email Anda.',
            user: {
              id: existingUserByEmail.id,
              username: existingUserByEmail.username,
              email: existingUserByEmail.email,
              emailVerified: existingUserByEmail.emailVerified
            }
          };
        } else {
          throw new ConflictException('Email sudah digunakan dan sudah diverifikasi. Silakan login.');
        }
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
      // Validate input
      const identifier = (loginDto.usernameOrEmail || '').trim();
      const password = (loginDto.password || '').trim();
      
      if (!identifier) {
        throw new UnauthorizedException('Username atau email harus diisi');
      }
      
      if (!password) {
        throw new UnauthorizedException('Password harus diisi');
      }

      console.log('[AUTH][LOGIN][START]', { identifier: identifier.substring(0, 3) + '***' });

      // Find user by username OR email
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: identifier },
            { email: identifier },
          ],
        },
      });

      if (!user) {
        console.log('[AUTH][LOGIN][USER_NOT_FOUND]', { identifier: identifier.substring(0, 3) + '***' });
        throw new UnauthorizedException('Username atau password salah');
      }

      console.log('[AUTH][LOGIN][USER_FOUND]', { id: user.id, username: user.username, emailVerified: user.emailVerified });

      // Check if user is active
      if (!user.isActive) {
        console.log('[AUTH][LOGIN][USER_INACTIVE]', { id: user.id });
        throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
      }

      // Email verification check (controlled by env)
      const requireEmailVerified = process.env.REQUIRE_EMAIL_VERIFIED === 'true';
      if (requireEmailVerified && !user.emailVerified) {
        console.log('[AUTH][LOGIN][EMAIL_NOT_VERIFIED]', { id: user.id });
        throw new UnauthorizedException('Email belum diverifikasi. Silakan cek email Anda.');
      }

      // Verify password with comprehensive error handling
      let isPasswordValid = false;
      try {
        if (!user.password) {
          console.log('[AUTH][LOGIN][NO_PASSWORD]', { id: user.id });
          throw new UnauthorizedException('Username atau password salah');
        }

        if (typeof user.password !== 'string') {
          console.log('[AUTH][LOGIN][INVALID_PASSWORD_TYPE]', { id: user.id, type: typeof user.password });
          throw new UnauthorizedException('Username atau password salah');
        }

        // Check if password looks like a valid bcrypt hash
        if (!user.password.startsWith('$2b$') && !user.password.startsWith('$2a$') && !user.password.startsWith('$2y$')) {
          console.log('[AUTH][LOGIN][INVALID_HASH_FORMAT]', { id: user.id, hashPrefix: user.password.substring(0, 4) });
          throw new UnauthorizedException('Username atau password salah');
        }

        console.log('[AUTH][LOGIN][COMPARING_PASSWORD]', { id: user.id });
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('[AUTH][LOGIN][PASSWORD_RESULT]', { id: user.id, valid: isPasswordValid });

      } catch (passwordError) {
        console.error('[AUTH][LOGIN][PASSWORD_ERROR]', { 
          id: user.id, 
          error: passwordError instanceof Error ? passwordError.message : String(passwordError),
          stack: passwordError instanceof Error ? passwordError.stack : undefined
        });
        
        if (passwordError instanceof UnauthorizedException) {
          throw passwordError;
        }
        
        throw new UnauthorizedException('Username atau password salah');
      }
      
      if (!isPasswordValid) {
        console.log('[AUTH][LOGIN][INVALID_PASSWORD]', { id: user.id });
        throw new UnauthorizedException('Username atau password salah');
      }

      console.log('[AUTH][LOGIN][SUCCESS]', { id: user.id, username: user.username });

      // Generate JWT token with proper payload
      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
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
        jwtSecret,
        { expiresIn: '7d' }
      );

      // Create session
      try {
        await this.prisma.session.create({
          data: {
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          }
        });
      } catch (sessionError) {
        console.error('[AUTH][LOGIN][SESSION_ERROR]', sessionError);
        // Continue even if session creation fails
      }

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
      
      // Log comprehensive error details
      console.error('[AUTH][LOGIN][ERROR]', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      if (process.env.DEBUG_AUTH_ERRORS === 'true') {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat login';
        throw new HttpException(`[DEBUG] ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
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

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

      // Selalu balas sukses untuk keamanan (tidak bocorkan email terdaftar/tidak)
      if (!user) {
        return { message: 'Jika email terdaftar, instruksi reset telah dikirim.' };
      }

      const token = (Math.floor(100000 + Math.random() * 900000)).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

      await this.prisma.user.update({
        where: { id: user.id },
        data: ({
          passwordResetToken: token,
          passwordResetExpires: expires,
        } as any)
      });

      await this.emailService.sendPasswordResetEmail(user.email, token);

      return { message: 'Jika email terdaftar, instruksi reset telah dikirim.' };
    } catch (error) {
      throw new HttpException('Terjadi kesalahan saat permintaan reset password', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto & { email?: string }) {
    try {
      const user = await this.prisma.user.findFirst({
        where: ({
          email: dto.email || undefined,
          passwordResetToken: dto.token,
          passwordResetExpires: { gt: new Date() },
        } as any)
      });

      if (!user) {
        throw new UnauthorizedException('Token reset tidak valid atau sudah kadaluarsa');
      }

      const hashed = await bcrypt.hash(dto.password, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: ({
          password: hashed,
          passwordResetToken: null,
          passwordResetExpires: null,
        } as any)
      });

      // Invalidate sessions
      await this.prisma.session.deleteMany({ where: { userId: user.id } });

      return { message: 'Password berhasil direset. Silakan login.' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new HttpException('Terjadi kesalahan saat reset password', HttpStatus.INTERNAL_SERVER_ERROR);
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
