import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../config/configuration';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    const mailConfig = this.configService.get('mail', { infer: true });
    this.from = mailConfig.from;
    this.frontendUrl = this.configService.get('frontendUrl', { infer: true });

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.port === 465,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${(error as Error).message}`,
      );
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/verify-email?token=${token}`;
    await this.send(
      to,
      'Verify your CivicTrack account',
      `<p>Welcome to CivicTrack. Please verify your email by clicking the link below:</p>
       <p><a href="${link}">${link}</a></p>
       <p>This link expires in 24 hours.</p>`,
    );
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${this.frontendUrl}/reset-password?token=${token}`;
    await this.send(
      to,
      'Reset your CivicTrack password',
      `<p>We received a request to reset your password. Click the link below to set a new password:</p>
       <p><a href="${link}">${link}</a></p>
       <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>`,
    );
  }

  async sendComplaintConfirmationEmail(
    to: string,
    trackingCode: string,
  ): Promise<void> {
    await this.send(
      to,
      'Complaint submitted successfully',
      `<p>Your complaint has been received.</p>
       <p>Tracking code: <strong>${trackingCode}</strong></p>
       <p>You can track its progress at any time using this code.</p>`,
    );
  }

  async sendStatusChangeEmail(
    to: string,
    trackingCode: string,
    status: string,
  ): Promise<void> {
    await this.send(
      to,
      `Update on complaint ${trackingCode}`,
      `<p>Your complaint <strong>${trackingCode}</strong> status has changed to <strong>${status}</strong>.</p>`,
    );
  }

  async sendAssignmentEmail(to: string, trackingCode: string): Promise<void> {
    await this.send(
      to,
      `Complaint ${trackingCode} assigned to you`,
      `<p>Complaint <strong>${trackingCode}</strong> has been assigned to you.</p>`,
    );
  }

  async sendNewComplaintEmail(
    to: string,
    trackingCode: string,
    title: string,
    departmentName: string,
  ): Promise<void> {
    await this.send(
      to,
      `New complaint in ${departmentName}: ${trackingCode}`,
      `<p>A new complaint has been submitted in your department.</p>
       <p>Tracking code: <strong>${trackingCode}</strong><br/>
       Title: ${title}</p>`,
    );
  }

  async sendDataCorrectionRequestedEmail(to: string, officerName: string): Promise<void> {
    await this.send(
      to,
      'New data correction request',
      `<p>${officerName} has submitted a data correction request that needs your review.</p>`,
    );
  }

  async sendDataCorrectionResolvedEmail(
    to: string,
    approved: boolean,
    adminNotes: string | null,
  ): Promise<void> {
    await this.send(
      to,
      approved ? 'Your data correction request was approved' : 'Your data correction request was rejected',
      approved
        ? `<p>Your data correction request was approved and the change has been applied.</p>`
        : `<p>Your data correction request was rejected.</p><p>Reason: ${adminNotes ?? 'No reason provided.'}</p>`,
    );
  }

  async sendNewCommentEmail(
    to: string,
    trackingCode: string,
    authorName: string,
  ): Promise<void> {
    await this.send(
      to,
      `New comment on complaint ${trackingCode}`,
      `<p>${authorName} commented on complaint <strong>${trackingCode}</strong>.</p>`,
    );
  }

  async sendOfficerWelcomeEmail(
    to: string,
    name: string,
    password: string,
  ): Promise<void> {
    const link = `${this.frontendUrl}/login`;
    await this.send(
      to,
      'Your CivicTrack officer account',
      `<p>Hello ${name},</p>
       <p>An officer account has been created for you on CivicTrack.</p>
       <p>Email: ${to}<br/>Temporary password: ${password}</p>
       <p>Please log in and change your password as soon as possible: <a href="${link}">${link}</a></p>`,
    );
  }
}
