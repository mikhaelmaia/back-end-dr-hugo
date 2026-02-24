import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRequest } from './dto/auth-request.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { StartPasswordRecoveryDto } from './dto/start-password-recovery.dto';
import { EmailConfirmDto } from './dto/email-confirm.dto';
import { ResendEmailConfirmationDto } from './dto/resend-email-confirmation.dto';
import { TokenService } from '../token/token.service';
import { JwtProviderService } from './aggregates/jwt-provider.service';
import { EmailHelper } from '../email/email.helper';
import { UserDto } from 'src/modules/users/dtos/user.dto';
import { TokenType } from 'src/core/vo/consts/enums';
import { compare } from 'bcrypt';
import { acceptFalseThrows, whenNullThrows } from 'src/core/utils/functions';
import { JwtPayload } from 'src/core/vo/types/types';
import { UserService } from 'src/modules/users/user.service';
import { toHttpException } from 'src/core/utils/errors.utils';

@Injectable()
export class AuthService {
  private readonly INVALID_REFRESH_TOKEN: string =
    'Token de atualização inválido';

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly jwtProviderService: JwtProviderService,
    private readonly emailHelper: EmailHelper,
  ) {}

  public async login(authRequest: AuthRequest): Promise<AuthResponse> {
    const { login, password, role } = authRequest;
    const user: UserDto = await this.userService.findByEmailOrTaxId(
      login,
      role,
    );
    whenNullThrows(user, () => toHttpException('E030'));

    acceptFalseThrows(user.isActive, () => toHttpException('E031'));

    const matches: boolean = await compare(password, user.password);
    acceptFalseThrows(matches, () => toHttpException('E029'));
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

  public async startPasswordRecovery(
    recoveryData: StartPasswordRecoveryDto,
  ): Promise<void> {
    const login = recoveryData.login;
    const role = recoveryData.role;

    const user: UserDto = await this.userService.findByEmailOrTaxId(
      login,
      role,
    );

    if (!user) {
      return;
    }

    acceptFalseThrows(user.isActive, () => toHttpException('E031'));

    const token = await this.tokenService.generateOrRenewToken(
      `${login}:${role}`,
      TokenType.PASSWORD_RESET,
    );
    await this.emailHelper.sendPasswordResetRequestEmail(
      user.name,
      user.email,
      token.token,
      role,
    );
  }

  public async performPasswordReset(
    passwordReset: PasswordResetDto,
  ): Promise<void> {
    const email = passwordReset.email;
    const role = passwordReset.role;

    const user = await this.userService.findByEmail(email, role);

    if (!user?.isActive) {
      return;
    }

    await this.tokenService.concludeToken(
      passwordReset.tokenIdentification,
      `${email}:${role}`,
      TokenType.PASSWORD_RESET,
    );
    await this.userService.updateUserPassword(
      email,
      passwordReset.password,
      role,
    );
    await this.emailHelper.sendPasswordResetEmail(user.name, user.email);
  }

  public async resendEmailConfirmation(
    resendData: ResendEmailConfirmationDto,
  ): Promise<void> {
    const user = await this.userService.findByEmail(
      resendData.email,
      resendData.role,
    );

    if (!user || user.isActive) {
      return;
    }

    const token = await this.tokenService.renewToken(
      `${user.email}:${user.role}`,
      TokenType.EMAIL_CONFIRMATION,
    );
    await this.emailHelper.sendEmailConfirmationEmail(
      user.name,
      user.email,
      token.token,
      user.role,
    );
  }

  public async confirmUserEmail(
    userEmailConfirm: EmailConfirmDto,
  ): Promise<void> {
    const userEmail = userEmailConfirm.email;
    const userRole = userEmailConfirm.role;
    const user = await this.userService.findByEmail(userEmail, userRole);

    if (!user || user.isActive) {
      return;
    }

    await this.tokenService.concludeToken(
      userEmailConfirm.tokenIdentification,
      `${userEmail}:${userRole}`,
      TokenType.EMAIL_CONFIRMATION,
    );

    await this.userService.validateUserEmail(user.id);
    await this.emailHelper.sendEmailConfirmedEmail(
      user.name,
      user.email,
      user.role,
    );
  }
}
