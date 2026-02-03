import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from 'src/core/vo/consts/enums';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  protected override alias = 'user';

  public constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  public findByEmail(email: string, role?: UserRole): Promise<User | null> {
    const query = this.createBaseQuery().where(`${this.alias}.email = :email`, {
      email,
    });

    if (role) {
      query.andWhere(`${this.alias}.role = :role`, { role });
    }

    return query.getOne();
  }

  public findByEmailOrTaxId(
    emailOrTaxId: string,
    role?: UserRole,
  ): Promise<User | null> {
    let query = this.createBaseQuery().where(
      `(${this.alias}.email = :emailOrTaxId OR ${this.alias}.taxId = :emailOrTaxId)`,
      {
        emailOrTaxId,
      },
    );

    if (role) {
      query = query.andWhere(`${this.alias}.role = :role`, { role });
    }

    return query.getOne();
  }

  public findUserProfilePictureId(userId: string): Promise<string | null> {
    return this.createBaseQuery()
      .leftJoin(`${this.alias}.profilePicture`, 'profilePicture')
      .select('profilePicture.id', 'profilePictureId')
      .where(`${this.alias}.id = :userId`, { userId })
      .getRawOne()
      .then((result) => (result ? result.profilePictureId : null));
  }

  public async updateProfilePicture(
    userId: string,
    profilePictureId: string | null,
  ): Promise<void> {
    await this.repository.update(
      { id: userId },
      { profilePicture: profilePictureId ? { id: profilePictureId } : null },
    );
  }

  public async activateUser(userId: string): Promise<void> {
    await this.repository.update({ id: userId }, { isActive: true });
  }
}
