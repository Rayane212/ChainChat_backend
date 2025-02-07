import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './user.model';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async findUserByEmail(email: string) : Promise<User | null> {
        try {
            return this.prisma.user.findUnique({
                where: {
                    email: email
                }
            });
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }

    findUserByUsername(username: string) {
        try {
            return this.prisma.user.findUnique({
                where: {
                    username: username
                }
            });
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    }


    existsByEmail(email: string): boolean {
        const user = this.findUserByEmail(email);
        return user !== null;
    }

    existsByUsername(username: string): boolean {
        const user = this.findUserByUsername(username);
        return user !== null;
    }

    async createUser(user: User): Promise<User> {
        const existing = await this.prisma.user.findUnique({
            where: {
                email: user.email,
                username: user.username

            }
        });
        if (existing) {
            throw new ConflictException('Email or username already exists');
        }
        return this.prisma.user.create({
            data: user
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
          where: { email },
        });
    }

}
