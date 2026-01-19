import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenModule } from '../token/token.module';
import { JwtProviderService } from './aggregates/jwt-provider.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { provideJwtModuleOptions } from '../../core/config/security/jwt.options';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    UserModule,
    TokenModule,
    EmailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        provideJwtModuleOptions(configService),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtProviderService],
  exports: [JwtProviderService],
})
export class AuthModule {}
