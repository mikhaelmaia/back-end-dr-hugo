import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { RequestUserChangeDto } from './dtos/request-user-change.dto';
import { UserChangeRequestService } from './user-change-request.service';
import { ConfirmUserChangeRequestDto } from './dtos/confirm-user-change-request.dto';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { UserChangeRequestPaths } from 'src/core/vo/consts/paths';

@ApiTags('Gerenciamento de Alteração de Dados')
@ApiBearerAuth()
@Controller(UserChangeRequestPaths.BASE)
export class UserChangeRequestController {
  constructor(private readonly service: UserChangeRequestService) {}

  @Post(UserChangeRequestPaths.REQUEST)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar alteração de dados pessoais',
    description:
      'Permite ao usuário solicitar alteração de e-mail e/ou telefone. Requer confirmação da senha atual e gera token para validação posterior.',
  })
  @ApiBody({
    description: 'Dados para solicitação de alteração',
    type: RequestUserChangeDto,
    examples: {
      emailChange: {
        summary: 'Alteração de e-mail',
        description: 'Exemplo de solicitação para alterar apenas o e-mail',
        value: {
          newEmail: 'novo.email@exemplo.com',
          currentPassword: 'MinhaSenh@Atual123',
        },
      },
      phoneChange: {
        summary: 'Alteração de telefone',
        description: 'Exemplo de solicitação para alterar apenas o telefone',
        value: {
          newPhone: '11987654321',
          newCountryCode: 'BR',
          newCountryIdd: '+55',
          currentPassword: 'MinhaSenh@Atual123',
        },
      },
      bothChanges: {
        summary: 'Alteração de e-mail e telefone',
        description: 'Exemplo de solicitação para alterar e-mail e telefone',
        value: {
          newEmail: 'novo.email@exemplo.com',
          newPhone: '11987654321',
          newCountryCode: 'BR',
          newCountryIdd: '+55',
          currentPassword: 'MinhaSenh@Atual123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Solicitação de alteração criada com sucesso. Token enviado para confirmação.',
    content: {
      'application/json': {
        example: {
          message:
            'Solicitação de alteração enviada com sucesso. Verifique seu e-mail/telefone para confirmar.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação - senha incorreta ou dados inválidos',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, ausente ou expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  public async requestChange(
    @CurrentUser('id') userId: string,
    @Body() dto: RequestUserChangeDto,
  ): Promise<void> {
    await this.service.requestChange(dto, userId);
  }

  @Post(UserChangeRequestPaths.CONFIRM)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar alteração de dados pessoais',
    description:
      'Confirma uma solicitação de alteração de dados através do hash obtido na validação do token. Efetiva a alteração no sistema.',
  })
  @ApiBody({
    description: 'Dados para confirmação da alteração',
    type: ConfirmUserChangeRequestDto,
    examples: {
      confirmChange: {
        summary: 'Confirmação de alteração',
        description: 'Exemplo de confirmação usando hash de token validado',
        value: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          hash: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef12',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Alteração confirmada e aplicada com sucesso',
    content: {
      'application/json': {
        example: {
          message: 'Dados alterados com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Erro de validação - token inválido, solicitação expirada ou já confirmada',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, ausente ou expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitação não encontrada ou não pertence ao usuário',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  public async confirmChange(
    @CurrentUser('id') userId: string,
    @Body() dto: ConfirmUserChangeRequestDto,
  ): Promise<void> {
    await this.service.confirmChange(dto, userId);
  }
}
