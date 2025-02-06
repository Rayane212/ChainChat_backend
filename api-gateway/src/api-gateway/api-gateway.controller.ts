import { HttpException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';


import { firstValueFrom, Observable } from 'rxjs';

@Controller('api')
export class ApiGatewayController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject('MESSAGING_SERVICE') private readonly messagingClient: ClientProxy,
  ) {}

  // Auth Routes
  @HttpCode(HttpStatus.CREATED)
  @Post('auth/register')
  async register(@Body() registerDto: any) {
    try {
      const response = await firstValueFrom(
        this.authClient.send('auth.register', registerDto)
      );
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw new HttpException(
        error.message || 'Service temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  async login(@Body() loginDto: any) {
    try {
      const response = await firstValueFrom(
        this.authClient.send('auth.login', loginDto)
      );
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw new HttpException(
        error.message || 'Service temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  @Post('auth/validate-token')
  async validateToken(@Body('token') token: string) {
    try {
      const response = await firstValueFrom(
        this.authClient.send('auth.validate-token', { token })
      );
      return response;
    } catch (error) {
      console.error('Token validation error:', error);
      throw new HttpException(
        error.message || 'Service temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  // Messaging Routes
  @UseGuards(AuthGuard)
  @Post('messages')
  async createMessage(
    @Request() req,
    @Body() messageData: { recipientId: string; content: string }
  ) {
    try {
      const data = {
        senderId: req.user.id,
        ...messageData
      };
      const response = await firstValueFrom(
        this.messagingClient.send('messages.create', data)
      );
      return response;
    } catch (error) {
      console.error('Message creation error:', error);
      throw new HttpException(
        error.message || 'Service temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }


  @UseGuards(AuthGuard)
  @Get('messages')
  async getMessagesForUser(@Request() req) {
    try {
      const userId = req.user.id;
      const response = await firstValueFrom(
        this.messagingClient.send('messages.get', { userId })
      );
      return response;
    } catch (error) {
      console.error('Get messages error:', error);
      throw new HttpException(
        error.message || 'Service temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  
}

