import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailReference } from './consts/email-reference';
import { EmailSend } from './dtos/email-send.dto';
import { ConfigService } from '@nestjs/config';
import { getCurrentLocalDateTimeFormatted } from 'src/core/utils/date-time.utils';
import { UserRole } from 'src/core/vo/consts/enums';
import { ResolutionKeyService } from '../resolution-key/resolution-key.service';

@Injectable()
export class EmailHelper {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly resolutionKeyService: ResolutionKeyService,
  ) {}

  public async sendPasswordResetRequestEmail(
    name: string,
    email: string,
    token: string,
    role: UserRole,
  ): Promise<void> {
    const encryptedParams = await this.createEncryptedQueryParam({
      email,
      token,
      role,
    });
    await this.emailService.sendEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.PASSWORD_RESET_REQUEST)
        .addParameter('name', name)
        .addParameter('email', email)
        .addParameter('token', token)
        .addParameter(
          'resetPasswordUrl',
          `${this.configService.get('web.baseUrl')}${this.configService.get('web.forgotPasswordPath')}?t=${encryptedParams}`,
        )
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
    userRole: UserRole,
    token: string,
  ): Promise<void> {
    const encryptedParams = await this.createEncryptedQueryParam({
      email,
      token,
      role: userRole,
    });
    await this.emailService.sendEmail(
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
          `${this.configService.get('web.baseUrl')}${this.configService.get('web.emailConfirmationPath')}?t=${encryptedParams}`,
        )
        .build(),
    );
  }

  public async sendEmailConfirmationEmail(
    name: string,
    email: string,
    token: string,
    role: UserRole,
  ): Promise<void> {
    const encryptedParams = await this.createEncryptedQueryParam({
      email,
      token,
      role,
    });
    await this.emailService.sendEmail(
      EmailSend.builder()
        .to(email)
        .reference(EmailReference.EMAIL_CONFIRMATION)
        .addParameter('name', name)
        .addParameter('email', email)
        .addParameter('token', token)
        .addParameter(
          'confirmationUrl',
          `${this.configService.get('web.baseUrl')}${this.configService.get('web.emailConfirmationPath')}?t=${encryptedParams}`,
        )
        .build(),
    );
  }

  public async sendEmailConfirmedEmail(
    name: string,
    email: string,
    userRole: UserRole,
  ): Promise<void> {
    await this.emailService.sendEmail(
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

  public async sendEmailChangeConfirmation(
    userId: string,
    newEmail: string,
    token: string,
    role: UserRole,
    requestId: string,
  ): Promise<void> {
    const encryptedParams = await this.createEncryptedQueryParam({
      userId,
      email: newEmail,
      token,
      role,
      requestId,
      type: 'email',
    });
    await this.emailService.sendEmail(
      EmailSend.builder()
        .to(newEmail)
        .reference(EmailReference.EMAIL_CHANGE_CONFIRMATION)
        .addParameter('userId', userId)
        .addParameter('newEmail', newEmail)
        .addParameter('token', token)
        .addParameter(
          'confirmationUrl',
          `${this.configService.get('web.baseUrl')}${this.configService.get('web.profileChangeConfirmationPath')}?t=${encryptedParams}`,
        )
        .build(),
    );
  }

  public async sendEmailChangedWarningToOldEmail(
    name: string,
    oldEmail: string,
    newEmail: string,
  ): Promise<void> {
    await this.emailService.sendEmail(
      EmailSend.builder()
        .to(oldEmail)
        .reference(EmailReference.EMAIL_CHANGED_WARNING)
        .addParameter('name', name)
        .addParameter('oldEmail', oldEmail)
        .addParameter('newEmail', newEmail)
        .addParameter('changedAt', getCurrentLocalDateTimeFormatted())
        .build(),
    );
  }

  public async sendEmailChangedConfirmationToNewEmail(
    name: string,
    oldEmail: string,
    newEmail: string,
  ): Promise<void> {
    await this.emailService.sendEmail(
      EmailSend.builder()
        .to(newEmail)
        .reference(EmailReference.EMAIL_CHANGED_CONFIRMATION)
        .addParameter('name', name)
        .addParameter('oldEmail', oldEmail)
        .addParameter('newEmail', newEmail)
        .addParameter('changedAt', getCurrentLocalDateTimeFormatted())
        .build(),
    );
  }

  private async createEncryptedQueryParam(
    params: Record<string, string | UserRole>,
  ): Promise<string> {
    const ttlSeconds = 24 * 60 * 60;
    return this.resolutionKeyService.create(params, ttlSeconds);
  }
}
