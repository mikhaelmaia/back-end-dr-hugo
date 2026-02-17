import { Module } from '@nestjs/common';
import { EmailHelper } from './email.helper';
import { EmailService } from './email.service';
import { EmailQueueService } from './email-queue.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { provideSmtpConnection } from './email.provider';
import { ResolutionKeyModule } from '../resolution-key/resolution-key.module';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) =>
        provideSmtpConnection(config),
      inject: [ConfigService],
    }),
    ResolutionKeyModule,
  ],
  providers: [EmailHelper, EmailService, EmailQueueService],
  exports: [EmailHelper],
})
export class EmailModule {}
