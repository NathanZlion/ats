import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { compare } from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

type UserResultDto = Omit<User, 'password'>;

type AuthResultDto = {
    accessToken: string;
    user: UserResultDto;
}

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async login(
        user: User,
        userAgent: string
    ): Promise<AuthResultDto> {
        const expiresInDays = this.configService.get<number>('SESSION_EXPIRES_IN_DAYS') ?? 7;
        const expiresInMilliseconds = expiresInDays * 24 * 60 * 60 * 1000;
        const expiresAt = new Date(Date.now() + expiresInMilliseconds);

        const accessToken = await this.generateAccessToken({ user: user });

        const { password, ...userResult } = user;

        return {
            accessToken,
            user: userResult,
        };
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.findOneByEmail(email);

        if (!user || ! await compare(password, user.password)) {
            return null;
        }

        return user;
    }

    private async generateAccessToken(payload: any): Promise<string> {
        return this.jwtService.signAsync(payload);
    }
}
