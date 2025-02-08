import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @GrpcMethod('MailService', 'SendMail')
  async sendMail(data: { to: string; subject: string; html: string }) {
    return this.mailService.sendMail(data.to, data.subject, data.html);
  }
}