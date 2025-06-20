import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly db: PrismaService) { }

    async createUser(createUserDto: Prisma.UserCreateInput): Promise<User> {
        return this.db.user.create({
            data: createUserDto,
        });
    }

    async findOneById(userId: string): Promise<User | null> {
        return this.db.user.findUnique({
            where: { id: userId },
        });
    }


    async findOneByEmail(email: string): Promise<User | null> {
        return this.db.user.findUnique({
            where: { email: email },
        });
    }
}
