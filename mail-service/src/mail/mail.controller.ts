import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @GrpcMethod('MailService', 'SendMail') 
  async sendMail(data: { to: string; subject: string; html: string }) {
    try {
      await this.mailService.sendMail({
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to send email' };
    }
  }
}