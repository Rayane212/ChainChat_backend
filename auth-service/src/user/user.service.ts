import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User } from './user.model';

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

    findUserById(id: number) {
        try {
            return this.prisma.user.findUnique({
                where: {
                    id: id
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

  async enableTwoFA(userId: number, secret: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { 
        twoFASecret: secret,
        isTwoFAEnabled: true,
      },
    });
  }

  async disableTwoFA(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { 
        twoFASecret: null,
        isTwoFAEnabled: false,
      },
    });
  }

  async isTwoFAEnabled(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isTwoFAEnabled: true },
    });

    return user?.isTwoFAEnabled || false;
  }

}
