import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';
import { UserEmailConfirmDto } from './dtos/user-email-confirm.dto';
import { UserService } from './user.service';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { UserPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { ResendUserEmailConfirmationDto } from './dtos/resend-user-email-confirmation.dto';
import { Public } from 'src/core/vo/decorators/public.decorator';

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

  @ApiOperation({
    summary: 'Reenviar confirmação de email',
    description: 'Reenvia o email de confirmação para um usuário que ainda não confirmou seu email. Se o usuário já estiver ativo, a operação será ignorada silenciosamente.'
  })
  @ApiResponse({
    status: 200,
    description: 'Email de confirmação reenviado com sucesso (ou usuário já ativo)',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Public()
  @Post(UserPaths.RESEND_EMAIL_CONFIRMATION)
  public async resendEmailConfirmation(@Body() resendUserEmailConfirmationDto: ResendUserEmailConfirmationDto): Promise<void> {
    await this.service.resendEmailConfirmation(resendUserEmailConfirmationDto.email);
  }

  @ApiOperation({
    summary: 'Confirmar email do usuário',
    description: 'Confirma o email de um usuário, ativando sua conta. Se o usuário já estiver ativo, a operação será ignorada silenciosamente.'
  })
  @ApiResponse({
    status: 200,
    description: 'Email confirmado com sucesso (ou usuário já ativo)',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Public()
  @Post(UserPaths.CONFIRM_EMAIL)
  public async confirmUserEmail(@Body() userEmailConfirmDto: UserEmailConfirmDto): Promise<void> {
    await this.service.confirmUserEmail(userEmailConfirmDto);
  }
}
