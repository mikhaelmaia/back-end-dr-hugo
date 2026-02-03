import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { EmailSend } from './dtos/email-send.dto';
import { EmailReference } from './consts/email-reference';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(emailSend: EmailSend): Promise<void> {
    const reference: EmailReference = emailSend.reference;
    
    try {
      this.logger.log(`Enviando email para ${emailSend.to} com template '${reference.templateName}'`);
      
      const result = await this.mailerService.sendMail({
        to: emailSend.to,
        subject: reference.subject,
        template: `./${reference.templateName}`,
        context: Object.fromEntries(emailSend.templateModel),
      });
      
      this.logger.log(
        `Email enviado com sucesso para ${emailSend.to}. MessageId: ${result.messageId}`,
      );
      
      if (result.response) {
        this.logger.debug(`Resposta SMTP: ${result.response}`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao enviar email para ${emailSend.to} com template '${reference.templateName}'`,
        error,
      );
      throw error;
    }
  }
}
