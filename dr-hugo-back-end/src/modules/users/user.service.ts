import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';
import { UserRepository } from './user.repository';
import { UserMapper } from './user.mapper';
import {
  acceptFalseThrows,
  compare,
  encrypt,
  isNotPresent,
  isPresent,
} from 'src/core/utils/functions';
import { EmailHelper } from 'src/core/modules/email/email.helper';
import { Optional } from 'src/core/utils/optional';
import { TokenService } from 'src/core/modules/token/token.service';
import { TokenType, UserRole } from 'src/core/vo/consts/enums';

@Injectable()
export class UserService extends BaseService<
  User,
  UserDto,
  UserRepository,
  UserMapper
> {
  protected override readonly ENTITY_NOT_FOUND: string =
    'Usuário não encontrado';

  private readonly COULDNT_RESEND_EMAIL_CONFIRMATION: string =
    'Não foi possível reenviar a confirmação de e-mail';

  public constructor(
    userRepository: UserRepository,
    userMapper: UserMapper,
    private readonly emailHelper: EmailHelper,
    private readonly tokenService: TokenService
  ) {
    super(userRepository, userMapper);
  }

  public async findByEmailOrTaxId(
    emailOrTaxId: string,
  ): Promise<UserDto | null> {
    return Optional.ofNullable(
      await this.repository.findByEmailOrTaxId(emailOrTaxId),
    )
      .map((user: User) => this.mapper.toDto(user))
      .orElse(null);
  }

  public async updateUserPassword(
    email: string,
    password: string,
  ): Promise<void> {
    const user: User = await this.repository.findByEmail(email);
    acceptFalseThrows(
      isPresent(user),
      () => new NotFoundException(this.ENTITY_NOT_FOUND),
    );
    user.updatePassword(await encrypt(password));
    await this.repository.save(user);
  }

  public async resendEmailConfirmation(email: string): Promise<void> {
    const user = Optional.ofNullable(await this.repository.findByEmail(email))
      .orElseThrow(() => new NotFoundException(this.COULDNT_RESEND_EMAIL_CONFIRMATION));
    const token = await this.tokenService.renewToken(
      user.email,
      TokenType.EMAIL_CONFIRMATION
    );
    this.emailHelper.sendEmailConfirmationEmail(user.name, user.email, token.token);
  }

  public async confirmUserEmail(email: string): Promise<void> {
    const user = Optional.ofNullable(await this.repository.findByEmail(email))
      .orElseThrow(() => new NotFoundException(this.COULDNT_RESEND_EMAIL_CONFIRMATION));
    user.activate();
    await this.repository.save(user);
    this.emailHelper.sendEmailConfirmedEmail(user.name, user.email, UserRole.PATIENT);
  }

  protected override async beforeCreate(entity: User): Promise<void> {
    entity.inactivate();
    await this.handleUserPassword(entity);
  }

  protected override async postCreate(entity: User): Promise<void> {
    const token = await this.tokenService.generateToken(
      entity.email,
      TokenType.EMAIL_CONFIRMATION
    );
    this.emailHelper.sendUserRegisteredEmail(entity.name, entity.email, UserRole.PATIENT, token.token);
  }

  protected override async beforeUpdate(entity: User): Promise<void> {
    await this.handleUserPassword(entity);
  }

  protected override mapToUpdateEntity(
    entityReceived: Partial<UserDto>,
    entityFound: User,
  ): User {
    entityFound.email = entityReceived.email || entityFound.email;
    entityFound.phone = entityReceived.phone || entityFound.phone;
    return entityFound;
  }

  private async handleUserPassword(user: User): Promise<void> {
    if (isNotPresent(user.id)) await this.handleUserNotExistsPassword(user);
    else await this.handleUserExistsPassword(user);
  }

  private async handleUserNotExistsPassword(user: User): Promise<void> {
    user.updatePassword(await encrypt(user.password));
  }

  private async handleUserExistsPassword(user: User): Promise<void> {
    const saved: User = await this.repository.findById(user.id);
    if (!user.password || (await compare(user.password, saved.password)))
      user.updatePassword(saved.password);
    else user.updatePassword(await encrypt(user.password));
  }
}
