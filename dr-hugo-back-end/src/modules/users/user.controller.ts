import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';

@ApiTags('Módulo de Usuários')
@Controller('users')
export class UserController extends BaseController<User, UserDto, UserService> {
  public constructor(userService: UserService) {
    super(userService);
  }

  @Get('current')
  public getCurrentUser(@CurrentUser() user: UserDto): UserDto {
    return user;
  }
}
