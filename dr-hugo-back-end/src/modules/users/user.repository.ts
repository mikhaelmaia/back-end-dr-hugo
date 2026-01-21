import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  protected override alias = 'user';

  public constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  public findByEmail(email: string): Promise<User | null> {
    return this.createBaseQuery()
      .where(`${this.alias}.email = :email`, { email })
      .getOne();
  }

  public findByEmailOrTaxId(
    emailOrTaxId: string,
  ): Promise<User | null> {
    return this.createBaseQuery()
      .where(`${this.alias}.email = :emailOrTaxId`, {
        emailOrTaxId,
      })
      .orWhere(`${this.alias}.taxId = :emailOrTaxId`, {
        emailOrTaxId,
      })
      .getOne();
  }
}
