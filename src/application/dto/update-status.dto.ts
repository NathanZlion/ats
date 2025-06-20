import { IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class UpdateStatusDto {
    @IsUUID()
    @IsNotEmpty()
    applicationId: string;

    @IsEnum(ApplicationStatus)
    @IsNotEmpty()
    newStatus: ApplicationStatus;
}
