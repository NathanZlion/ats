import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request as ReqExpress } from 'express';
import { User } from '@prisma/client';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { LoginUserData } from './decorators/getUserInLogin.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() _: LoginDto,
        @LoginUserData() user: User,
        @Req() req: ReqExpress,
    ) {
        return this.authService.login(user, req.headers['user-agent'] || 'unknown');
    }


    @Public()
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('signup')
    async signup(
        @Body() _: LoginDto,
        @LoginUserData() user: User,
        @Req() req: ReqExpress,
    ) {
        return this.authService.login(user, req.headers['user-agent'] || 'unknown');
    }
}
