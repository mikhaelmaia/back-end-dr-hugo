import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

export const provideSmtpConnection = async (
  config: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: config.get('smtp.host'),
    port: config.get('smtp.port'),
    secure: true,
    auth: {
      user: config.get('smtp.user'),
      pass: config.get('smtp.password'),
    },
  },
  defaults: {
    from: config.get('smtp.user'),
  },
  template: {
    dir: join(__dirname, 'templates'),
    adapter: new EjsAdapter(),
    options: {
      strict: false,
    },
  },
});
