import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    @Inject('MESSAGING_SERVICE') private readonly messagingClient: ClientProxy
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    const token = authHeader.split(' ')[1];

    try {
      // 🔹 1. Valider le token via RabbitMQ (AuthService)
      const result = await this.rabbitMQService.sendRpc('auth_queue', {
        pattern: 'auth.validate-token',
        token,
      });

      if (!result || !result.valid) {
        return false;
      }

      // 🔹 2. Attacher l'utilisateur validé à la requête
      const { id, email, username } = result.decoded;
      const user = { id: id.toString(), email, username };
      request.user = user;

      // 🔹 3. Synchroniser l'utilisateur avec le service de messagerie (MessagingService)
      await firstValueFrom(
        this.messagingClient.send('sync_user', { user })
      );

      return true;
    } catch (error) {
      console.error('❌ Erreur de validation du token ou de synchronisation:', error);
      return false;
    }
  }
}