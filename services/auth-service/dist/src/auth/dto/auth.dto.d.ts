export declare class RegisterDto {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}
export declare class LoginDto {
    username: string;
    password: string;
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
}
