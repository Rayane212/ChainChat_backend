import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MessagingDto } from './dto/messaging.dto';

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
    @MessageBody() messageData: MessagingDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
  
      const data = new MessagingDto();
      data.senderId = client.data.user.id;
      data.recipientId = messageData.recipientId || '1';
      data.content = messageData.content || 'Hello, World!';  


      const message = await this.messagingService.createMessage(data);
      const user = await this.userService.addMessageToUser(data.senderId, message.id);  

      client.emit('messageSent', message); 
      this.server.to(`user-1`).emit('messageReceived', message);
    } catch (error) {
      console.log('Error handling sendMessage:', error);
      console.error('Error handling sendMessage:', error.message);
      client.emit('error', { type: 'send_message_error', message: error.message });
    }
  }
}