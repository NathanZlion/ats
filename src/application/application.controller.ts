import { Role } from 'src/common/enums/role.enum';
import {
    Post,
    Get,
    Param,
    Body,
    Query,
    Controller,
    UseInterceptors,
    UploadedFile,
    ParseUUIDPipe
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { UploadService } from 'src/upload/upload.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/common/pipes/file-validation';
import { ApplyJobDto } from './dto/apply.dto';
import { CurrentUser } from 'src/user/decorators/current_user.decorator';
import { User } from 'generated/prisma';
import { UpdateStatusDto } from './dto/update-status.dto';


@Controller('application')
export class ApplicationController {
    constructor(
        private readonly applicationService: ApplicationService,
        private readonly uploadService: UploadService
    ) { }

    @Post('apply')
    @Roles(Role.Applicant)
    @UseInterceptors(FileInterceptor('resume'))
    async applicationCreate(
        @UploadedFile(new FileValidationPipe(['application/pdf'], 2)) resume: Express.Multer.File,
        @Body() dto: ApplyJobDto,
        @CurrentUser() user: User
    ) {
        if (!resume) {
            throw new Error('Resume file is required');
        }

        const resumeUrl = await this.uploadService.uploadResume(resume);

        const body = {
            ...dto,
            resume: resumeUrl,
            userId: user.id
        };

        return this.applicationService.apply(user.id, body);
    }


    @Get('mine')
    @Roles(Role.Applicant)
    async myApplications(
        @CurrentUser() user: User,
        @Query('page') page = 1,
        @Query('size') size = 10,
    ) {
        return this.applicationService.getMyApplications(user.id, page, size)
    }

    @Get('job/:jobId')
    @Roles(Role.Company)
    async applicationsForJob(
        @CurrentUser() user: User,
        @Param('jobId', ParseUUIDPipe) jobId: string,
        @Query('page') page = 1,
        @Query('size') size = 10,
    ) {
        return this.applicationService.getApplicationsForJob(jobId, user.id, page, size);
    }

    @Post('status')
    @Roles(Role.Company)
    async updateStatus(
        @CurrentUser() user: User,
        @Body() dto: UpdateStatusDto,
    ) {
        return this.applicationService.updateStatus(dto.applicationId, dto.newStatus, user.id);
    }
}