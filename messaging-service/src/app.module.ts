import { Module } from '@nestjs/common';
import { MessagingModule } from './messaging/messaging.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [MessagingModule, UserModule],
})
export class AppModule {}
