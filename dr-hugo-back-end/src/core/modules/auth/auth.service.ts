import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRequest } from './dto/auth-request.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { TokenService } from '../token/token.service';
import { JwtProviderService } from './aggregates/jwt-provider.service';
import { EmailHelper } from '../email/email.helper';
import { UserDto } from 'src/modules/users/dtos/user.dto';
import { TokenType } from 'src/core/vo/consts/enums';
import { compare } from 'bcrypt';
import { acceptFalseThrows } from 'src/core/utils/functions';
import { JwtPayload } from 'src/core/vo/types/types';
import { UserService } from 'src/modules/users/user.service';

@Injectable()
export class AuthService {
  private readonly INVALID_CREDENTIALS: string = 'E-mail ou senha inválidos';

  private readonly INVALID_REFRESH_TOKEN: string =
    'Token de atualização inválido';

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly jwtProviderService: JwtProviderService,
    private readonly emailhelper: EmailHelper,
  ) {}

  public async login(authRequest: AuthRequest): Promise<AuthResponse> {
    const { login, password } = authRequest;
    const user: UserDto = await this.userService.findByEmailOrTaxId(login);
    const matches: boolean = await compare(password, user.password);
    acceptFalseThrows(
      matches,
      () => new UnauthorizedException(this.INVALID_CREDENTIALS),
    );
    return this.jwtProviderService.signTokens(user);
  }

  public async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const jwtPayload: JwtPayload =
      await this.jwtProviderService.verify(refreshToken);
    const exists: boolean = await this.userService.existsById(jwtPayload.sub);
    acceptFalseThrows(
      exists,
      () => new UnauthorizedException(this.INVALID_REFRESH_TOKEN),
    );
    return this.jwtProviderService.signTokens(
      await this.userService.findById(jwtPayload.sub),
    );
  }

  public async startPasswordRecovery(login: string): Promise<void> {
    const user: UserDto = await this.userService.findByEmailOrTaxId(login);
    if (!user) {
      return;
    }
    const token = await this.tokenService.generateToken(
      login,
      TokenType.PASSWORD_RESET,
    );
    this.emailhelper.sendPasswordResetRequestEmail(
      user.name,
      user.email,
      token.token,
    );
  }

  public async performPasswordReset(
    passwordReset: PasswordResetDto,
  ): Promise<void> {
    await this.tokenService.concludeToken(
      passwordReset.tokenIdentification,
      passwordReset.email,
      TokenType.PASSWORD_RESET,
    );
    await this.userService.updateUserPassword(
      passwordReset.email,
      passwordReset.password,
    );
    this.emailhelper.sendPasswordResetEmail(
      passwordReset.email,
      passwordReset.email,
    );
  }
}
