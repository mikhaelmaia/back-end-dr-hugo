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

@Injectable()
export class UserService extends BaseService<
  User,
  UserDto,
  UserRepository,
  UserMapper
> {
  protected override readonly ENTITY_NOT_FOUND: string =
    'Usuário não encontrado';

  public constructor(
    userRepository: UserRepository,
    userMapper: UserMapper,
    private readonly emailHelper: EmailHelper,
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

  protected override async beforeCreate(entity: User): Promise<void> {
    await this.handleUserPassword(entity);
  }

  protected override async postCreate(entity: User): Promise<void> {
    await this.emailHelper.sendUserRegisteredEmail(entity.name, entity.email);
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
