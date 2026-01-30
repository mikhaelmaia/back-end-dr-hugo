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
import { acceptFalseThrows, acceptTrueThrows, whenNullThrows } from 'src/core/utils/functions';
import { JwtPayload } from 'src/core/vo/types/types';
import { UserService } from 'src/modules/users/user.service';
import { toHttpException } from 'src/core/utils/errors.utils';
import { Optional } from 'src/core/utils/optional';

@Injectable()
export class AuthService {
  private readonly INVALID_REFRESH_TOKEN: string =
    'Token de atualização inválido';

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly jwtProviderService: JwtProviderService,
    private readonly emailhelper: EmailHelper,
  ) {}

  public async login(authRequest: AuthRequest): Promise<AuthResponse> {
    const { login, password, role } = authRequest;
    const user: UserDto = await this.userService.findByEmailOrTaxId(login, role);
    whenNullThrows(
      user, () => toHttpException('E030')
    );

    acceptFalseThrows(
      user.isActive,
      () => toHttpException('E031'),
    );

    const matches: boolean = await compare(password, user.password);
    acceptFalseThrows(
      matches,
      () => toHttpException('E029'),
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

  public async startPasswordRecovery(recoveryData: StartPasswordRecoveryDto): Promise<void> {
    const user: UserDto = await this.userService.findByEmailOrTaxId(recoveryData.login, recoveryData.role);
    whenNullThrows(
      user, () => toHttpException('E030')
    );

    acceptFalseThrows(
      user.isActive,
      () => toHttpException('E031'),
    );

    const token = await this.tokenService.generateToken(
      `${recoveryData.login}:${recoveryData.role}`,
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
      `${passwordReset.email}:${passwordReset.role}`,
      TokenType.PASSWORD_RESET,
    );
    await this.userService.updateUserPassword(
      passwordReset.email,
      passwordReset.password,
      passwordReset.role,
    );
    this.emailhelper.sendPasswordResetEmail(
      passwordReset.email,
      passwordReset.email,
    );
  }

  public async resendEmailConfirmation(resendData: ResendEmailConfirmationDto): Promise<void> {
    const user = Optional.ofNullable(await this.userService.findByEmailEntity(resendData.email, resendData.role))
      .orElse(null);
    whenNullThrows(
      user,
      () => toHttpException('E033')
    );
    acceptTrueThrows(
      user.isValid,
      () => toHttpException('E036')
    );

    const token = await this.tokenService.renewToken(
      `${user.email}:${user.role}`,
      TokenType.EMAIL_CONFIRMATION
    );
    this.emailhelper.sendEmailConfirmationEmail(user.name, user.email, token.token);
  }

  public async confirmUserEmail(userEmailConfirm: EmailConfirmDto): Promise<void> {
    const userEmail = userEmailConfirm.email;
    const userRole = userEmailConfirm.role;
    const user = Optional.ofNullable(await this.userService.findByEmailEntity(userEmail, userRole))
      .orElse(null);
    whenNullThrows(
      user,
      () => toHttpException('E033')
    );
    acceptTrueThrows(
      user.isValid,
      () => toHttpException('E036')
    );
    await this.tokenService.concludeToken(
      userEmailConfirm.tokenIdentification, 
      `${userEmail}:${userRole}`, 
      TokenType.EMAIL_CONFIRMATION
    );
    user.validate();
    await this.userService.saveUserEntity(user);
    this.emailhelper.sendEmailConfirmedEmail(user.name, user.email, user.role);
  }
}
