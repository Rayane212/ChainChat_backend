import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

@WebSocketGateway({ cors: { origin: '*' }})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  
  constructor(
    @Inject('MESSAGING_SERVICE') private readonly messagingClient: ClientProxy,
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

      client.data.user = payload;
      client.join(`user-${payload.id}`);
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
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messageData = {
        senderId: client.data.user.id,
        recipientId: data.recipientId,
        content: data.content
      };

      const response = await firstValueFrom(
        this.messagingClient.send('messages.create', messageData)
      );

      if (response.status === 'success') {
        client.emit('messageSent', response.data);
        this.server.to(`user-${data.recipientId}`).emit('messageReceived', response.data);
      } else {
        client.emit('error', {
          type: 'send_message_error',
          message: response.message
        });
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error.message);
      client.emit('error', {
        type: 'send_message_error',
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
}