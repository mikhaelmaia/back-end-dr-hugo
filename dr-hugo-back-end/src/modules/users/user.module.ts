import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserMapper } from './user.mapper';
import { EmailModule } from 'src/core/modules/email/email.module';
import { TokenModule } from 'src/core/modules/token/token.module';
import { MediaModule } from 'src/core/modules/media/media.module';
import { InternalHttpModule } from 'src/core/modules/http/http.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    MediaModule,
    TokenModule,
    InternalHttpModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserMapper, UserRepository],
  exports: [UserService],
})
export class UserModule {}
