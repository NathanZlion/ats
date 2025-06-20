import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { UploadService } from 'src/upload/upload.service';

@Module({
  providers: [ApplicationService, UploadService],
  controllers: [ApplicationController]
})
export class ApplicationModule { }
