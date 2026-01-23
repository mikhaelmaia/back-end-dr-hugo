import { Injectable } from '@nestjs/common';
import { EmailQueueService } from './email-queue.service';
import { EmailReference } from './consts/email-reference';
import { EmailSend } from './dtos/email-send.dto';
import { ConfigService } from '@nestjs/config';
import { getCurrentLocalDateTimeFormatted } from 'src/core/utils/date-time.utils';
import { UserRole } from 'src/core/vo/consts/enums';

@Injectable()
export class EmailHelper {
  constructor(
    private readonly emailQueueService: EmailQueueService,
    private readonly configService: ConfigService,
  ) {}

  public sendPasswordResetRequestEmail(
    name: string,
    email: string,
    token: string,
  ): void {
    this.emailQueueService.enqueueEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.PASSWORD_RESET_REQUEST)
        .addParameter('name', name)
        .addParameter('email', email)
        .addParameter('token', token)
        .build(),
    );
  }

  public sendPasswordResetEmail(
    name: string,
    email: string,
  ): void {
    this.emailQueueService.enqueueEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.PASSWORD_RESET)
        .addParameter('name', name)
        .addParameter('estimatedUpdatedAt', getCurrentLocalDateTimeFormatted())
        .build(),
    );
  }

  public sendUserRegisteredEmail(
    name: string,
    email: string,
    userRole: UserRole,
    token: string,
  ): void {
    this.emailQueueService.enqueueEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.USER_REGISTERED)
        .addParameter('name', name)
        .addParameter('email', email)
        .addParameter('userRole', userRole)
        .addParameter('token', token)
        .addParameter(
          'estimatedRegisteredAt',
          getCurrentLocalDateTimeFormatted(),
        )
        .addParameter(
          'confirmationUrl',
          `${this.configService.get('web.baseUrl')}${this.configService.get('web.emailConfirmationPath')}?token=${token}`,
        )
        .build(),
    );
  }

  public sendEmailConfirmationEmail(
    name: string,
    email: string,
    token: string,
  ): void {
    this.emailQueueService.enqueueEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.EMAIL_CONFIRMATION)
        .addParameter('name', name)
        .addParameter('email', email)
        .addParameter('token', token)
        .addParameter(
          'confirmationUrl',
          `${this.configService.get('web.baseUrl')}${this.configService.get('web.emailConfirmationPath')}?token=${token}`,
        )
        .build(),
    );
  }

  public sendEmailConfirmedEmail(
    name: string,
    email: string,
    userRole: UserRole,
  ): void {
    this.emailQueueService.enqueueEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.EMAIL_CONFIRMED)
        .addParameter('name', name)
        .addParameter('email', email)
        .addParameter('userRole', userRole)
        .addParameter(
          'estimatedConfirmedAt',
          getCurrentLocalDateTimeFormatted(),
        )
        .addParameter(
          'loginPageUrl',
          `${this.configService.get('web.baseUrl')}${this.configService.get('web.loginPath')}`,
        )
        .build(),
    );
  }
}
