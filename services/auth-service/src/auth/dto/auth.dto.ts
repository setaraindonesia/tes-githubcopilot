import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Username minimal 3 karakter' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username hanya boleh huruf, angka, dan underscore' })
  username: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class LoginDto {
  @IsString()
  usernameOrEmail: string;

  @IsString()
  password: string;
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  newPassword: string;
}