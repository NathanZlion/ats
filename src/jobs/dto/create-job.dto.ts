import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateJobDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(20)
    @MaxLength(2000)
    description: string;

    @IsString()
    @IsOptional()
    location?: string;
}