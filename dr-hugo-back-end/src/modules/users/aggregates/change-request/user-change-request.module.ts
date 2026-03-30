import { Module } from '@nestjs/common';
import { EmailModule } from 'src/core/modules/email/email.module';
import { TokenModule } from 'src/core/modules/token/token.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChangeRequest } from './entities/user-change-request.entity';
import { UserChangeRequestController } from './user-change-request.controller';
import { UserChangeRequestService } from './user-change-request.service';
import { UserChangeRequestRepository } from './user-change-request.repository';
import { UserModule } from '../../user.module';
import { CryptoModule } from 'src/core/modules/crypto/crypto.module';
import { ResolutionKeyModule } from 'src/core/modules/resolution-key/resolution-key.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserChangeRequest]),
    EmailModule,
    TokenModule,
    UserModule,
    CryptoModule,
    ResolutionKeyModule,
  ],
  controllers: [UserChangeRequestController],
  providers: [UserChangeRequestService, UserChangeRequestRepository],
  exports: [UserChangeRequestService],
})
export class UserChangeRequestModule {}
