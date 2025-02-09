import { Controller, UseGuards } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagingAuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';

@Controller('messages')
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly userService: UserService,
  ) {}

  @MessagePattern('messages.create')
  async createMessage(@Payload() data: any) {
    try {
      const message = await this.messagingService.createMessage(data);
      return {
        status: 'success',
        message: 'Message created successfully',
        data: message
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to create message',
        error: error.message
      };
    }
  }

  @MessagePattern('messages.get')
  async getMessagesForUser(@Payload() data: any ) {
    try {
      const { userId } = data;
      console.log('userId', userId);
      const messages = await this.messagingService.getMessagesForUser(userId);
      return {
        status: 'success',
        data: messages
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to fetch messages',
        error: error.message
      };
    }
  }

  @MessagePattern('sync_user')
  async syncUser(@Payload() data: any) {
    try {
      const user = await this.userService.findOrCreateUser(data);
      return {
        status: 'success',
        message: 'User created successfully',
        data: user
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to create user',
        error: error.message
      };
    }
  }
}