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
import { MediaService } from 'src/core/modules/media/media.service';
import { MinioBuckets } from 'src/core/modules/media/minio/minio.buckets';
import { MediaDto } from 'src/core/modules/media/dtos/media.dto';

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
    private readonly tokenService: TokenService,
    private readonly mediaService: MediaService,
  ) {
    super(userRepository, userMapper);
  }

  public async findByEmailOrTaxId(
    emailOrTaxId: string,
    role: UserRole,
  ): Promise<UserDto | null> {
    return Optional.ofNullable(
      await this.repository.findByEmailOrTaxId(emailOrTaxId, role),
    )
      .map((user: User) => this.mapper.toDto(user))
      .orElse(null);
  }

  public async findByEmail(
    email: string,
    role?: UserRole,
  ): Promise<UserDto | null> {
    return Optional.ofNullable(await this.repository.findByEmail(email, role))
      .map((user: User) => this.mapper.toDto(user))
      .orElse(null);
  }

  public async validateUserEmail(userId: string): Promise<void> {
    await this.repository.activateUser(userId);
  }

  public async updateProfilePicture(
    userId: string,
    file: Express.Multer.File | null,
  ): Promise<MediaDto> {
    const currentUserProfilePictureId =
      await this.repository.findUserProfilePictureId(userId);

    if (currentUserProfilePictureId) {
      await this.mediaService.deleteById(currentUserProfilePictureId);
    }

    const mediaDto = await this.mediaService.createMedia(
      file,
      MinioBuckets.USERS,
    );
    await this.repository.updateProfilePicture(userId, mediaDto.id);

    return mediaDto;
  }

  public async updateUserPassword(
    email: string,
    password: string,
    role?: UserRole,
  ): Promise<void> {
    const user: User = await this.repository.findByEmail(email, role);
    acceptFalseThrows(
      isPresent(user),
      () => new NotFoundException(this.ENTITY_NOT_FOUND),
    );
    user.updatePassword(await encrypt(password));
    await this.repository.save(user);
  }

  public async findUserProfilePicture(userId: string): Promise<MediaDto> {
    const profilePictureId =
      await this.repository.findUserProfilePictureId(userId);
    return this.mediaService.findById(profilePictureId);
  }

  protected override async beforeCreate(entity: User): Promise<void> {
    entity.inactivate();
    await this.handleUserPassword(entity);
  }

  protected override async postCreate(entity: User): Promise<void> {
    const token = await this.tokenService.generateToken(
      `${entity.email}:${entity.role}`,
      TokenType.EMAIL_CONFIRMATION,
    );
    this.emailHelper.sendUserRegisteredEmail(
      entity.name,
      entity.email,
      UserRole.PATIENT,
      token.token,
    );
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
