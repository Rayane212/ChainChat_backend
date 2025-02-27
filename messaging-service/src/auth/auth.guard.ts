import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "src/user/user.service";

@Injectable()
export class MessagingAuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userInfo = request.user; 

    if (!userInfo) {
      throw new UnauthorizedException('User information missing');
    }

    // Initialiser ou récupérer l'utilisateur dans MongoDB
    const mongoUser = await this.userService.findOrCreateUser({
      id: userInfo.id,
      email: userInfo.email
    });

    request.mongoUser = mongoUser;
    return true;
  }
}
