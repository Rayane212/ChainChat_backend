import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MessagingDto } from './dto/messaging.dto';
import { instanceToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { ValidationPipe } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server:Server;
  constructor(
    private readonly messagingService: MessagingService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;

      if (!authHeader) {
        console.error('Authorization header is missing');
        return client.disconnect();
      }

      const payload = this.jwtService.verify(authHeader, { secret: process.env.JWT_SECRET }); 

      if (!payload || !payload.id) {
        console.error('Invalid token payload');
        return client.disconnect();
      }

      const user = await this.userService.findOne(payload.id.toString());

      if (!user) {
        console.error('User not found');
        return client.disconnect();
      }

      client.data.user = user; 
      client.join(`user-${user.id}`); 
    } catch (error) {
      console.error('JWT validation error:', error.message);
      client.disconnect(); 
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {

      // format data :
      // {
      //   "senderId": "2",
      //   "recipientId": "1",
      //   "content": "Hello"
      // }

      const { recipientId, content } = JSON.parse(data);

      const message = await this.messagingService.createMessage({
        senderId: client.data.user.id,
        recipientId: recipientId,
        content: content,
      }as MessagingDto);

      await this.userService.addMessageToUser(client.data.user.id, message.id);

      client.emit('messageSent', message); 
      this.server.to(`user-${recipientId}`).emit('messageReceived', message); 

    } catch (error) {
      console.error('Error in handleSendMessage:', error.message);

      client.emit('error', {
        type: 'send_message_error',
        message: error.message || 'An unexpected error occurred',
      });
    }
  }


  @SubscribeMessage('events')
   handleEvent(@MessageBody() data: any): MessagingDto {
    return data;
  }
}