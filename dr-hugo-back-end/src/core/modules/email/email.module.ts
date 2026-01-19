import { Module } from '@nestjs/common';
import { EmailHelper } from './email.helper';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { provideSmtpConnection } from './email.provider';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) =>
        provideSmtpConnection(config),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailHelper, EmailService],
  exports: [EmailHelper],
})
export class EmailModule {}
