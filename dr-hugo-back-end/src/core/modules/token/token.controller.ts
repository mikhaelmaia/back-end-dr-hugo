import { Controller, HttpCode, HttpStatus, Post, Body } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenDto } from './dtos/token.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBody,
  ApiBadRequestResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { Token } from './entities/token.entity';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { TokenPaths } from '../../vo/consts/paths';
import { TokenValidationDto } from './dtos/token-validation.dto';
import { ValidateTokenDto } from './dtos/validate-token.dto';
import { ExceptionResponse } from '../../config/exceptions/exception-response';

@ApiTags('Gerenciamento de Tokens')
@Public()
@Controller(TokenPaths.BASE)
export class TokenController extends BaseController<
  Token,
  TokenDto,
  TokenService
> {
  public constructor(tokenService: TokenService) {
    super(tokenService);
  }

  @Post(TokenPaths.VALIDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar token de acesso',
    description: 'Valida um token de acesso gerado para um usuário específico. O token pode ser usado para redefinição de senha ou confirmação de e-mail.',
    operationId: 'validateToken'
  })
  @ApiBody({
    description: 'Dados necessários para validar o token',
    type: ValidateTokenDto,
    examples: {
      passwordReset: {
        summary: 'Validação de token para redefinição de senha',
        description: 'Exemplo de validação de token para redefinição de senha',
        value: {
          token: '123456',
          identification: 'usuario@exemplo.com',
          type: 'PASSWORD_RESET'
        }
      },
      emailConfirmation: {
        summary: 'Validação de token para confirmação de e-mail',
        description: 'Exemplo de validação de token para confirmação de e-mail',
        value: {
          token: '654321',
          identification: 'novo@exemplo.com',
          type: 'EMAIL_CONFIRMATION'
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Token validado com sucesso',
    type: TokenValidationDto,
    content: {
      'application/json': {
        example: {
          hash: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Erro de validação - token inválido, expirado ou não encontrado',
    type: ExceptionResponse,
    content: {
      'application/json': {
        examples: {
          tokenInvalido: {
            summary: 'Token inválido',
            description: 'Token não encontrado ou inválido para a identificação fornecida',
            value: {
              path: '/token/validate',
              method: 'POST',
              name: 'Bad Request',
              status: 400,
              message: 'Token inválido',
              timestamp: '2026-01-23T10:30:00.000Z'
            }
          },
          tokenExpirado: {
            summary: 'Token expirado',
            description: 'Token expirado (mais de 3 minutos desde a criação)',
            value: {
              path: '/token/validate',
              method: 'POST',
              name: 'Bad Request',
              status: 400,
              message: 'Token inválido',
              timestamp: '2026-01-23T10:30:00.000Z'
            }
          }
        }
      }
    }
  })
  public async validateToken(
    @Body() validateTokenDto: ValidateTokenDto,
  ): Promise<TokenValidationDto> {
    return await this.service.validateToken(
      validateTokenDto.token,
      validateTokenDto.identification,
      validateTokenDto.type
    );
  }
}
