import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest } from './dto/auth-request.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { ApplicationResponse } from 'src/core/vo/types/types';

@ApiTags('Módulo de Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  public async login(
    @Body() authRequest: AuthRequest,
  ): Promise<ApplicationResponse<AuthResponse>> {
    return ApplicationResponse.success(
      await this.authService.login(authRequest),
    );
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @Public()
  public async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<ApplicationResponse<AuthResponse>> {
    return ApplicationResponse.success(
      await this.authService.refreshToken(refreshToken),
    );
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.OK)
  @Public()
  public async startPasswordRecovery(
    @Body('email') email: string,
  ): Promise<ApplicationResponse<void>> {
    return ApplicationResponse.success(
      await this.authService.startPasswordRecovery(email),
    );
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @Public()
  public async performPasswordReset(
    @Body() passwordReset: PasswordResetDto,
  ): Promise<ApplicationResponse<void>> {
    return ApplicationResponse.success(
      await this.authService.performPasswordReset(passwordReset),
    );
  }
}
