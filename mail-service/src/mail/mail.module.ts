import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailQueue } from './mail.queue';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [MailService, MailQueue],
    exports: [MailService],
})
export class MailModule {}