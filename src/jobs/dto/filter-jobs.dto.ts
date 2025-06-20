import { IsOptional, IsString } from 'class-validator';

export class FilterJobsDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    companyName?: string;
}
