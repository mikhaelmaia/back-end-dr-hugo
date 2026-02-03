import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailSend } from './dtos/email-send.dto';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(private readonly emailService: EmailService) {}

  public enqueueEmail(emailSend: EmailSend): void {
    setImmediate(() => this.processEmail(emailSend));
  }

  private async processEmail(emailSend: EmailSend): Promise<void> {
    try {
      await this.emailService.sendEmail(emailSend);
    } catch (error) {
      this.logger.error(
        `Falha ao enviar email para ${emailSend.to}. Erro será ignorado para não afetar o fluxo principal.`,
        error
      );
    }
  }
}