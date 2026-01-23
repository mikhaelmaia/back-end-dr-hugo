import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserMapper } from './user.mapper';
import { EmailModule } from 'src/core/modules/email/email.module';
import { TokenModule } from 'src/core/modules/token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailModule, TokenModule],
  controllers: [UserController],
  providers: [UserService, UserMapper, UserRepository],
  exports: [UserService],
})
export class UserModule {}
