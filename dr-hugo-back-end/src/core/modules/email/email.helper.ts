import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailReference } from './consts/email-reference';
import { EmailSend } from './dtos/email-send.dto';
import { ConfigService } from '@nestjs/config';
import { getCurrentLocalDateTimeFormatted } from 'src/core/utils/date-time.utils';
import { UserRole } from 'src/core/vo/consts/enums';

@Injectable()
export class EmailHelper {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  public async sendPasswordResetRequestEmail(
    name: string,
    email: string,
    token: string,
  ): Promise<void> {
    await this.emailService.sendEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.PASSWORD_RESET_REQUEST)
        .addParameter('name', name)
        .addParameter('email', email)
        .addParameter('token', token)
        .build(),
    );
  }

  public async sendPasswordResetEmail(
    name: string,
    email: string,
  ): Promise<void> {
    await this.emailService.sendEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.PASSWORD_RESET)
        .addParameter('name', name)
        .addParameter('estimatedUpdatedAt', getCurrentLocalDateTimeFormatted())
        .build(),
    );
  }

  public async sendUserRegisteredEmail(
    name: string,
    email: string,
    userRole?: UserRole,
  ): Promise<void> {
    await this.emailService.sendEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.USER_REGISTERED)
        .addParameter('name', name)
        .addParameter('email', email)
        .addParameter('userRole', userRole || UserRole.PACIENT)
        .addParameter(
          'estimatedRegisteredAt',
          getCurrentLocalDateTimeFormatted(),
        )
        .addParameter(
          'loginPageUrl',
          `${this.configService.get('dh.baseUrl')}/${this.configService.get('dh.loginPath')}`,
        )
        .build(),
    );
  }

  public async sendEmailConfirmationEmail(
    name: string,
    email: string,
    token: string,
  ): Promise<void> {
    await this.emailService.sendEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.EMAIL_CONFIRMATION)
        .addParameter('name', name)
        .addParameter('email', email)
        .addParameter('token', token)
        .addParameter(
          'confirmationUrl',
          `${this.configService.get('dh.baseUrl')}/${this.configService.get('dh.emailConfirmationPath')}`,
        )
        .build(),
    );
  }
}
