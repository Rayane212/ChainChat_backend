import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    async findOrCreateUser(data: any) {
        const { id, username, email } = data.user;

        const userId = id.toString();
        // const msgIds : string[] = obj.map((msg) => msg.id);
        let user = await this.prismaService.user.findUnique({
          where: 
            { email: data.user.email }
        });

        if (!user) {
          user = await this.prismaService.user.create({
            data: { 
              id:userId, 
              username, 
              email,
              messages: 
                {
                  create: []
                },
              receivedMessages: {
                create: []
              }
            },
          });
        }
    
        return user;
      }

      async findOne(id: string) {
        return this.prismaService.user.findUnique({
          where: { id },
        });
      }

      async create(userData: any) {
        return this.prismaService.user.create({
          data: userData,
        });
      }

      async addMessageToUser(userId: string, messageId: string) {
        return this.prismaService.user.update({
          where: { id: userId },
          data: {
            messages: {
              connect: { id: messageId },
            },
          },
        });
      }

}

