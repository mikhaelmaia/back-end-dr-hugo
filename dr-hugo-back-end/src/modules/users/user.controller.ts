import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { UserPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';

@ApiTags('Gerenciamento de Usuários')
@ApiBearerAuth()
@Controller(UserPaths.BASE)
export class UserController extends BaseController<User, UserDto, UserService> {
  public constructor(userService: UserService) {
    super(userService);
  }

  @ApiOperation({
    summary: 'Obter dados do usuário atual',
    description: 'Retorna os dados completos do usuário autenticado atualmente na sessão, incluindo informações pessoais e de perfil.'
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário atual retornados com sucesso',
    type: UserDto
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, ausente ou expirado',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado (sessão inválida)',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Get(UserPaths.CURRENT)
  public getCurrentUser(@CurrentUser() user: UserDto): UserDto {
    return user;
  }
}
