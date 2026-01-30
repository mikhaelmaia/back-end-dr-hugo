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
    const query = this.createBaseQuery()
      .where(`${this.alias}.email = :email`, { email });
    
    if (role) {
      query.andWhere(`${this.alias}.role = :role`, { role });
    }
    
    return query.getOne();
  }

  public findByEmailOrTaxId(emailOrTaxId: string, role?: UserRole): Promise<User | null> {
    const query = this.createBaseQuery()
      .where(`${this.alias}.email = :emailOrTaxId`, {
        emailOrTaxId,
      })
      .orWhere(`${this.alias}.taxId = :emailOrTaxId`, {
        emailOrTaxId,
      });
    
    if (role) {
      query.andWhere(`${this.alias}.role = :role`, { role });
    }
    
    return query.getOne();
  }

  public async updateProfilePicture(userId: string, profilePictureId: string | null): Promise<void> {
    await this.repository.update(
      { id: userId },
      { profilePicture: profilePictureId ? { id: profilePictureId } : null }
    );
  }
}
