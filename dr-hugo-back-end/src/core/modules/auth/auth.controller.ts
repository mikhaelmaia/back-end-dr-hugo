import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest } from './dto/auth-request.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { AuthPaths } from '../../vo/consts/paths';

@ApiTags('Módulo de Autenticação')
@Controller(AuthPaths.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(AuthPaths.LOGIN)
  @HttpCode(HttpStatus.OK)
  @Public()
  public async login(@Body() authRequest: AuthRequest): Promise<AuthResponse> {
    return await this.authService.login(authRequest);
  }

  @Post(AuthPaths.REFRESH_TOKEN)
  @HttpCode(HttpStatus.OK)
  @Public()
  public async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AuthResponse> {
    return await this.authService.refreshToken(refreshToken);
  }

  @Post(AuthPaths.PASSWORD_RECOVERY)
  @HttpCode(HttpStatus.OK)
  @Public()
  public async startPasswordRecovery(
    @Body('email') email: string,
  ): Promise<void> {
    return await this.authService.startPasswordRecovery(email);
  }

  @Post(AuthPaths.PASSWORD_RESET)
  @HttpCode(HttpStatus.OK)
  @Public()
  public async performPasswordReset(
    @Body() passwordReset: PasswordResetDto,
  ): Promise<void> {
    return await this.authService.performPasswordReset(passwordReset);
  }
}
