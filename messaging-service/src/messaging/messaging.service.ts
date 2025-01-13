import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MessagingDto } from './dto/messaging.dto';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}


  async createMessage(messageData: MessagingDto) {
    const message = await this.prisma.message.create({
      data: {
        sender: {
          connect: { id: messageData.senderId},
        },
        recipient: {
          connect: { id: messageData.recipientId },
        },
        content: messageData.content,
        conversationId: `${messageData.senderId}-${messageData.recipientId}`,
        createdAt: new Date(),
        readAt: null,
        isDeleted: false,
      },
      include: {
        sender: true,
        recipient: true,
      },
    });

    return message;
  }

  async getMessagesForUser(userId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}