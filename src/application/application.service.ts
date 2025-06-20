import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ApplyJobDto } from './dto/apply.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationService {
    constructor(private prisma: PrismaService) { }

    async apply(userId: string, dto: ApplyJobDto & { resume: string }) {
        const { jobId, coverLetter, resume } = dto;

        const existing = await this.prisma.application.findFirst({
            where: { applicantId: userId, jobId },
        });
        if (existing) {
            throw new BadRequestException('You already applied to this job');
        }

        const application = await this.prisma.application.create({
            data: {
                applicantId: userId,
                jobId,
                resumeLink: resume,
                coverLetter,
                status: ApplicationStatus.Applied,
                appliedAt: new Date(),
            },
        });

        return {
            success: true,
            message: 'Application submitted successfully',
            object: application,
            errors: null,
        };
    }

    async getMyApplications(userId: string, page = 1, size = 10) {
        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                where: { applicantId: userId },
                skip: (page - 1) * size,
                take: size,
                include: {
                    job: {
                        select: {
                            title: true,
                            createdBy: true,
                        },
                    },
                },
                orderBy: { appliedAt: 'desc' },
            }),
            this.prisma.application.count({ where: { applicantId: userId } }),
        ]);

        const formatted = applications.map((app) => ({
            jobTitle: app.job.title,
            companyName: app.job.createdBy,
            status: app.status,
            appliedAt: app.appliedAt,
        }));

        return {
            success: true,
            message: 'Your applications',
            object: formatted,
            pageNumber: page,
            pageSize: size,
            totalSize: total,
            errors: null,
        };
    }

    async getApplicationsForJob(jobId: string, companyId: string, page = 1, size = 10) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job) {
            throw new NotFoundException('Job not found');
        }
        if (job.createdBy !== companyId) {
            throw new ForbiddenException('Unauthorized access');
        }

        const [applications, total] = await Promise.all([
            this.prisma.application.findMany({
                where: { jobId },
                skip: (page - 1) * size,
                take: size,
                include: {
                    applicant: { select: { name: true } },
                },
                orderBy: { appliedAt: 'desc' },
            }),
            this.prisma.application.count({ where: { jobId } }),
        ]);

        const formatted = applications.map((app) => ({
            applicantName: app.applicant.name,
            resumeLink: app.resumeLink,
            coverLetter: app.coverLetter,
            status: app.status,
            appliedAt: app.appliedAt,
        }));

        return {
            success: true,
            message: 'Applications for job',
            object: formatted,
            pageNumber: page,
            pageSize: size,
            totalSize: total,
            errors: null,
        };
    }

    async updateStatus(applicationId: string, newStatus: ApplicationStatus, companyId: string) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        if (application.job.createdBy !== companyId) {
            throw new ForbiddenException('Unauthorized');
        }

        const updated = await this.prisma.application.update({
            where: { id: applicationId },
            data: { status: newStatus },
        });

        return {
            success: true,
            message: 'Application status updated',
            object: updated,
            errors: null,
        };
    }
}


