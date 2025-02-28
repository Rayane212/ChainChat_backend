import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const msg = context.getMessage();

    try {
      const result = await this.authService.register(data);
      const response = { status: 'success', result };

      channel.ack(msg);
      return response;
    } catch (error) {
      channel.ack(msg);
      return { status: 'error', message: error.message };
    }
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log(`Pattern: ${context.getPattern()}`);
    const channel = context.getChannelRef();
    const msg = context.getMessage();
    console.log(context);

    try {
      const result = await this.authService.login(data);
      const response = { status: 'success', result };

      channel.ack(msg);
      return response;
    } catch (error) {
      channel.ack(msg);
      return { status: 'error', message: error.message };
    }
  }

  @MessagePattern('auth.validate-token')
  async validateToken(@Payload() data: { token: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const msg = context.getMessage();

    try {
      const decoded = await this.authService.validateToken(data.token);
      const response = { valid: true, decoded };

      channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
        correlationId: msg.properties.correlationId,
      });

      channel.ack(msg);
    } catch (error) {
      const response = { valid: false, error: error.message };

      channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
        correlationId: msg.properties.correlationId,
      });

      channel.ack(msg);
    }
  }
}