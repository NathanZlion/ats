import { IsString, IsNotEmpty, IsUUID, IsOptional, MaxLength, IsUrl } from 'class-validator';


export class ApplyJobDto {
    @IsUUID()
    @IsNotEmpty()
    jobId: string;

    @IsUrl()
    @IsNotEmpty()
    resumeLink: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    coverLetter?: string;
}
