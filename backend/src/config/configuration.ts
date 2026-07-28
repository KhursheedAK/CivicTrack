import type { StringValue } from 'ms';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  database: {
    url: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiry: StringValue;
    refreshExpiry: StringValue;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessExpiry: (process.env.JWT_ACCESS_EXPIRY ?? '15m') as StringValue,
    refreshExpiry: (process.env.JWT_REFRESH_EXPIRY ?? '7d') as StringValue,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  mail: {
    host: process.env.RESEND_SMTP_HOST ?? 'smtp.resend.com',
    port: parseInt(process.env.RESEND_SMTP_PORT ?? '465', 10),
    user: process.env.RESEND_SMTP_USER ?? 'resend',
    pass: process.env.RESEND_SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'noreply@civictrack.app',
  },
});
