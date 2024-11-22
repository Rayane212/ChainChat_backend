import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';


@Injectable()
export class JwtUserGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    const decoded = this.jwtService.decode(token);

    // Remplir ou récupérer l'utilisateur dans MongoDB via Prisma
    const user = await this.userService.findOrCreateUser({
      id: decoded.id, 
      username: decoded.username,
      email: decoded.email,
    });

    request.user = user;

    return true;
  }
}