import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
    constructor(private config: ConfigService) {
        cloudinary.config({
            cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
            api_key: config.get('CLOUDINARY_API_KEY'),
            api_secret: config.get('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadResume(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException('Only PDF files are allowed');
        }

        if (file.size > 2 * 1024 * 1024) {
            throw new BadRequestException('File too large. Max size is 2MB');
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    folder: 'resumes',
                    format: 'pdf',
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result || !result.secure_url) {
                        return reject(new BadRequestException('Upload failed'));
                    }
                    resolve(result.secure_url);
                },
            );

            Readable.from(file.buffer).pipe(uploadStream);
        });
    }
}

