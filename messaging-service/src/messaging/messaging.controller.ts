import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtUserGuard } from 'src/auth/auth.guard';

@Controller('messages')
@UseGuards(JwtUserGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  async createMessage(@Body() data: { senderId: string; recipientId: string; content: string }) {
    return this.messagingService.createMessage(data);
  }

  @Get()
  async getMessagesForUser(@Query('userId') userId: string) {
    return this.messagingService.getMessagesForUser(userId);
  }
}