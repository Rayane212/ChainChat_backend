import { Module } from '@nestjs/common';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';
import { PrismaService } from 'src/prisma.service';
import { MessagingController } from './messaging.controller';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Module({
    providers: [MessagingGateway, MessagingService, PrismaService, JwtService, UserService],
    controllers: [MessagingController]
})
export class ChatModule {}
