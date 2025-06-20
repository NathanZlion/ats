import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    Body,
    Query,
    Req,
} from '@nestjs/common';
import { JobService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobService: JobService) { }

    @Roles(Role.Company)
    @Post()
    createJob(@Body() createJobDto: CreateJobDto, @Req() req) {
        return this.jobService.create(createJobDto, req.user);
    }

    @Roles(Role.Applicant)
    @Get()
    browseJobs(@Query() query) {
        return this.jobService.getAll(query);
    }

    @Get(':id')
    getJob(@Param('id') id: string) {
        return this.jobService.getById(id);
    }

    @Roles(Role.Company)
    @Put(':id')
    updateJob(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @Req() req) {
        return this.jobService.update(id, req.user, updateJobDto);
    }

    @Roles(Role.Company)
    @Delete(':id')
    deleteJob(@Param('id') id: string, @Req() req) {
        return this.jobService.delete(id, req.user);
    }
}

@Roles(Role.Company)
@Controller('company/jobs')
export class CompanyJobsController {
    constructor(private readonly jobsService: JobService) { }

    @Get()
    getCompanyJobs(@Req() req, @Query() query) {
        return this.jobsService.getCompanyJobs(req.user, query);
    }
}
