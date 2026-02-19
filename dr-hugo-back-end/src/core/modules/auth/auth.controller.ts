import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthRequest } from './dto/auth-request.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { StartPasswordRecoveryDto } from './dto/start-password-recovery.dto';
import { EmailConfirmDto } from './dto/email-confirm.dto';
import { ResendEmailConfirmationDto } from './dto/resend-email-confirmation.dto';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { AuthPaths } from '../../vo/consts/paths';
import { ExceptionResponse } from '../../config/exceptions/exception-response';

@ApiTags('Autenticação e Autorização')
@Controller(AuthPaths.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Autenticar usuário',
    description:
      'Realiza a autenticação do usuário no sistema usando email/CPF/CNPJ e senha, retornando tokens de acesso e renovação.',
  })
  @ApiBody({
    description: 'Credenciais de autenticação do usuário',
    type: AuthRequest,
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticação realizada com sucesso',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de autenticação inválidos ou malformados',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais incorretas ou usuário não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Dados não atendem aos critérios de validação',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Post(AuthPaths.LOGIN)
  @HttpCode(HttpStatus.OK)
  @Public()
  public async login(@Body() authRequest: AuthRequest): Promise<AuthResponse> {
    return await this.authService.login(authRequest);
  }

  @ApiOperation({
    summary: 'Renovar token de acesso',
    description:
      'Gera um novo par de tokens (acesso e renovação) usando um refresh token válido, mantendo a sessão do usuário ativa.',
  })
  @ApiBody({
    description: 'Token de renovação para gerar novos tokens',
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Token de renovação válido obtido no login',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados com sucesso',
    type: AuthResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token ausente ou malformado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado ou revogado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Post(AuthPaths.REFRESH_TOKEN)
  @HttpCode(HttpStatus.OK)
  @Public()
  public async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AuthResponse> {
    return await this.authService.refreshToken(refreshToken);
  }

  @ApiOperation({
    summary: 'Iniciar recuperação de senha',
    description:
      'Processa solicitação de recuperação de senha. Por motivos de segurança, sempre retorna sucesso independente de o usuário existir. Se o usuário existir e estiver ativo, um email será enviado com instruções.',
  })
  @ApiBody({
    description: 'Dados para início da recuperação de senha',
    type: StartPasswordRecoveryDto,
  })
  @ApiResponse({
    status: 200,
    description:
      'Solicitação processada com sucesso. Email enviado apenas se o usuário existir e estiver ativo.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados ausentes ou formato inválido',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Conta aguardando verificação de email',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Dados não atendem aos critérios de validação',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Post(AuthPaths.PASSWORD_RECOVERY)
  @HttpCode(HttpStatus.OK)
  @Public()
  public async startPasswordRecovery(
    @Body() startPasswordRecoveryDto: StartPasswordRecoveryDto,
  ): Promise<void> {
    return await this.authService.startPasswordRecovery(
      startPasswordRecoveryDto,
    );
  }

  @ApiOperation({
    summary: 'Redefinir senha do usuário',
    description:
      'Realiza a redefinição da senha usando o token de recuperação enviado por email. Invalida todos os tokens existentes do usuário.',
  })
  @ApiBody({
    description: 'Dados para redefinição da senha',
    type: PasswordResetDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Senha redefinida com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou malformados',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de recuperação inválido ou expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Dados não atendem aos critérios de validação',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Post(AuthPaths.PASSWORD_RESET)
  @HttpCode(HttpStatus.OK)
  @Public()
  public async performPasswordReset(
    @Body() passwordReset: PasswordResetDto,
  ): Promise<void> {
    return await this.authService.performPasswordReset(passwordReset);
  }

  @ApiOperation({
    summary: 'Reenviar confirmação de email',
    description:
      'Processa solicitação de reenvio de confirmação de email. Por motivos de segurança, sempre retorna sucesso independente de o usuário existir ou já estar validado.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Solicitação processada com sucesso. Email reenviado apenas se usuário existir e ainda não estiver validado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Public()
  @Post(AuthPaths.RESEND_EMAIL_CONFIRMATION)
  @HttpCode(HttpStatus.OK)
  public async resendEmailConfirmation(
    @Body() resendEmailConfirmationDto: ResendEmailConfirmationDto,
  ): Promise<void> {
    await this.authService.resendEmailConfirmation(resendEmailConfirmationDto);
  }

  @ApiOperation({
    summary: 'Confirmar email do usuário',
    description:
      'Processa confirmação de email do usuário. Por motivos de segurança, sempre retorna sucesso independente de o usuário existir ou do token ser válido.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Solicitação processada com sucesso. Email confirmado apenas se usuário existir, não estiver validado e token for válido.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos ou token inválido/expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Public()
  @Post(AuthPaths.CONFIRM_EMAIL)
  @HttpCode(HttpStatus.OK)
  public async confirmUserEmail(
    @Body() emailConfirmDto: EmailConfirmDto,
  ): Promise<void> {
    await this.authService.confirmUserEmail(emailConfirmDto);
  }
}
