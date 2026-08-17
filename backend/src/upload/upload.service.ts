import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { AppConfig } from '../config/configuration';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class UploadService implements OnModuleInit {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  onModuleInit(): void {
    const cloudinaryConfig = this.configService.get('cloudinary', {
      infer: true,
    });
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloudName,
      api_key: cloudinaryConfig.apiKey,
      api_secret: cloudinaryConfig.apiSecret,
      secure: true,
    });
  }

  async uploadToCloudinary(file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'civictrack' },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            reject(
              new InternalServerErrorException(
                'Failed to upload file to Cloudinary',
              ),
            );
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
