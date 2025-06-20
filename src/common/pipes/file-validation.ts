import {
    PipeTransform,
    Injectable,
    BadRequestException,
    ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
    constructor(
        private allowedMimeTypes: string[],
        private maxSizeMB = 2,
    ) { }

    transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
        if (!file) throw new BadRequestException('File is required');

        if (!file.mimetype) {
            throw new BadRequestException('File type is not specified');
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type. Allowed: ${this.allowedMimeTypes.join(', ')}`,
            );
        }

        const maxBytes = this.maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new BadRequestException(
                `File too large. Max size is ${this.maxSizeMB}MB`,
            );
        }

        return file;
    }
}
