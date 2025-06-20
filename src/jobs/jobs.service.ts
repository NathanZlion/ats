import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateJobDto, UpdateJobDto, FilterJobsDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobService {
    constructor(private prisma: PrismaService) { }

    async create(_dto: CreateJobDto, userId: string) {
        const { ...dto } = _dto;
        const job = await this.prisma.job.create({
            data: {
                ...dto,
                createdBy: userId,
            },
        });
        return {
            success: true,
            message: 'Job created successfully',
            object: job,
            errors: null,
        };
    }

    async update(jobId: string, userId: string, dto: UpdateJobDto) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new NotFoundException('Job not found');
        if (job.createdBy !== userId)
            throw new ForbiddenException('Unauthorized access');

        const updated = await this.prisma.job.update({
            where: { id: jobId },
            data: {
                ...dto
            },
        });

        return {
            success: true,
            message: 'Job updated successfully',
            object: updated,
            errors: null,
        };
    }

    async delete(jobId: string, userId: string) {
        const job = await this.prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new NotFoundException('Job not found');
        if (job.createdBy !== userId)
            throw new ForbiddenException('Unauthorized access');

        await this.prisma.job.delete({ where: { id: jobId } });

        return {
            success: true,
            message: 'Job deleted successfully',
            object: null,
            errors: null,
        };
    }

    async getAll(
        filters: { title?: string; location?: string; company?: string },
        page = 1,
        size = 10
    ) {
        const { title, location, company } = filters;

        const where: Prisma.JobWhereInput = {
            title: title ? { contains: title, mode: 'insensitive' } : undefined,
            location: location ? { contains: location, mode: 'insensitive' } : undefined,
            createdBy: company,
        };

        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                skip: (page - 1) * size,
                take: size,
                orderBy: { createdAt: 'desc' },
                include: {
                    company: {
                        select: { name: true, id: true },
                    }
                },
            }),
            this.prisma.job.count({ where }),
        ]);

        return {
            success: true,
            message: 'Jobs retrieved',
            object: jobs,
            pageNumber: page,
            pageSize: size,
            totalSize: total,
            errors: null,
        };
    }


    async getById(jobId: string, userId?: string) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                company: { select: { name: true, id: true } },
            },
        });
        if (!job) {
            return {
                success: false,
                message: 'Job not found',
                object: null,
                errors: null,
            };
        }

        return {
            success: true,
            message: 'Job details',
            object: job,
            errors: null,
        };
    }

    async getCompanyJobs(userId: string, page = 1, size = 10) {
        const [jobs, total] = await Promise.all([
            this.prisma.job.findMany({
                where: { createdBy: userId },
                skip: (page - 1) * size,
                take: size,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { applications: true },
                    },
                },
            }),
            this.prisma.job.count({ where: { createdBy: userId } }),
        ]);

        return {
            success: true,
            message: 'Company jobs retrieved',
            object: jobs,
            pageNumber: page,
            pageSize: size,
            totalSize: total,
            errors: null,
        };
    }
}
