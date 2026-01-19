import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailSend } from './dtos/email-send.dto';
import { EmailReference } from './consts/email-reference';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(emailSend: EmailSend): Promise<void> {
    const reference: EmailReference = emailSend.reference;
    await this.mailerService.sendMail({
      to: emailSend.to,
      subject: reference.subject,
      template: `./${reference.templateName}`,
      context: Object.fromEntries(emailSend.templateModel),
    });
  }
}
