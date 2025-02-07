import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway/api-gateway.controller';
import { ApiGatewayModule } from './api-gateway/api-gateway.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ApiGatewayModule, AuthModule, UserModule],
})
export class AppModule {}
