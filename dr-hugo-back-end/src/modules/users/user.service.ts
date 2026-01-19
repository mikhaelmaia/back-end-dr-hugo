import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';
import { UserRepository } from './user.repository';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserService extends BaseService<
  User,
  UserDto,
  UserRepository,
  UserMapper
> {
  public constructor(userRepository: UserRepository, userMapper: UserMapper) {
    super(userRepository, userMapper);
  }
}
