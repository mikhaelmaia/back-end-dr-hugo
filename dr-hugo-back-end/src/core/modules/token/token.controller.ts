import { Controller, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenDto } from './dtos/token.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery,
  ApiBadRequestResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { Token } from './entities/token.entity';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { TokenType } from 'src/core/vo/consts/enums';
import { TokenPaths } from '../../vo/consts/paths';
import { TokenValidationDto } from './dtos/token-validation.dto';
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
  @ApiQuery({
    name: 'token',
    description: 'Token de 6 dígitos gerado para o usuário',
    type: String,
    example: '123456',
    required: true
  })
  @ApiQuery({
    name: 'identification',
    description: 'Identificação do usuário (e-mail ou ID) associada ao token',
    type: String,
    example: 'usuario@exemplo.com',
    required: true
  })
  @ApiQuery({
    name: 'type',
    description: 'Tipo de token a ser validado',
    enum: TokenType,
    enumName: 'TokenType',
    example: TokenType.PASSWORD_RESET,
    required: true
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
    @Query('token') token: string,
    @Query('identification') identification: string,
    @Query('type') type: TokenType,
  ): Promise<TokenValidationDto> {
    return await this.service.validateToken(token, identification, type);
  }
}
