import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ApplicationModule } from './application/application.module';
import { JobsModule } from './jobs/jobs.module';
import { UploadModule } from './upload/upload.module';
import { CommonModule } from './common/common.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/role.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ApplicationModule,
    JobsModule,
    UploadModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

  ],
})
export class AppModule { }
