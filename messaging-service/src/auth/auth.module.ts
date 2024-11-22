
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  providers: [PrismaService, JwtStrategy, UserService],
  imports: [
    UserModule, 
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
})
export class AuthModule {}
