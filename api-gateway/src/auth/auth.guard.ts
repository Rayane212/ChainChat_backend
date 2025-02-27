import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('MESSAGING_SERVICE') private messagingClient: ClientProxy
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }
    
    const token = authHeader.split(' ')[1];
    
    const result = await firstValueFrom(
      this.authClient.send('auth.validate-token', {token})
    );

    const { valid, decoded } = result;
    if (!valid) {
      return false;
    }
    const { id, email, username } = decoded;
    const user = {
      id : id.toString(),
      email, 
      username 
    };

    request.user = user;


    if (user) {
      // Synchroniser l'utilisateur avec le service de messagerie
      const result = await firstValueFrom(
        this.messagingClient.send('sync_user', { user })
      );
      return true;
    }
    return false;
  }
}
