import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;
  private readonly appWebUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    this.appWebUrl = process.env.APP_WEB_URL || 'http://localhost:3000';
  }

  public async sendVerificationEmail(recipientEmail: string, token: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('RESEND_API_KEY is not set; skipping sending verification email.');
      return;
    }

    const verifyUrl = `${this.appWebUrl}/verify-email?token=${encodeURIComponent(token)}`;

    const subject = 'Kode Verifikasi Email Setaradapps';
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin: 0 0 12px; color: #111827;">Selamat datang di Setaradapps 👋</h2>
        <p style="margin: 0 0 16px;">Gunakan <strong>kode verifikasi 6 digit</strong> berikut untuk memverifikasi email Anda.</p>
        <div style="font-size:28px;letter-spacing:8px;font-weight:700;background:#f3f4f6;padding:12px;border-radius:8px;text-align:center;color:#111827;">${token}</div>
        <p style="margin: 16px 0 8px;">Atau klik tombol di bawah ini:</p>
        <p style="margin: 0 0 16px;">
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#0066FF;color:#ffffff;text-decoration:none;border-radius:8px;">Verifikasi via Tautan</a>
        </p>
        <p style="font-size:12px;color:#6b7280;margin-top:16px;">Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
      </div>
    `;

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: recipientEmail,
        subject,
        html,
      });
      this.logger.log(`Verification email enqueued for ${recipientEmail} (id: ${result?.data?.id ?? 'n/a'})`);
    } catch (error) {
      this.logger.error(`Failed sending verification email to ${recipientEmail}`, error as Error);
    }
  }
}


