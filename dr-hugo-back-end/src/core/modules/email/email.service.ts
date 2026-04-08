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
    const startedAt = Date.now();

    this.logger.log(
      `[COMM] channel=email status=started recipient=${emailSend.to} template=${reference.templateName} subject="${reference.subject}"`,
    );

    try {
      const result = await this.mailerService.sendMail({
        to: emailSend.to,
        subject: reference.subject,
        template: `./${reference.templateName}`,
        context: Object.fromEntries(emailSend.templateModel),
      });

      const duration = Date.now() - startedAt;

      this.logger.log(
        `[COMM] channel=email status=success recipient=${emailSend.to} template=${reference.templateName} messageId=${result.messageId ?? 'n/a'} duration=${duration}ms`,
      );

      if (result.response) {
        this.logger.debug(
          `[COMM] channel=email smtp_response="${result.response}" recipient=${emailSend.to}`,
        );
      }
    } catch (error) {
      const duration = Date.now() - startedAt;

      this.logger.error(
        `[COMM] channel=email status=failed recipient=${emailSend.to} template=${reference.templateName} duration=${duration}ms error="${(error as Error)?.message}"`,
        error,
      );
      throw error;
    }
  }
}
