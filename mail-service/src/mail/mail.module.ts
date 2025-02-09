import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailQueue } from './mail.queue';
import { ConfigModule } from '@nestjs/config';
import { MailController } from './mail.controller';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [MailController],
    providers: [MailService, MailQueue],
    exports: [MailService],
})
export class MailModule {}