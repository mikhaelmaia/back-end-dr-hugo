import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from 'src/core/vo/consts/enums';
import { CryptoService } from 'src/core/modules/crypto/crypto.service';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  protected override alias = 'user';

  public constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    private readonly cryptoService: CryptoService,
  ) {
    super(userRepository);
  }

  public findByEmail(email: string, role?: UserRole): Promise<User | null> {
    const emailHash = this.cryptoService.hashForSearch(email);
    const query = this.createBaseQuery().where(
      `${this.alias}.emailHash = :emailHash`,
      { emailHash },
    );

    if (role) {
      query.andWhere(`${this.alias}.role = :role`, { role });
    }

    return query.getOne();
  }

  public findByEmailOrTaxId(
    emailOrTaxId: string,
    role?: UserRole,
  ): Promise<User | null> {
    const hash = this.cryptoService.hashForSearch(emailOrTaxId);
    let query = this.createBaseQuery().where(
      `(${this.alias}.emailHash = :hash OR ${this.alias}.taxIdHash = :hash)`,
      { hash },
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

  public async findEmailById(userId: string): Promise<string | null> {
    const result = await this.createBaseQuery()
      .select(`${this.alias}.email`, 'email')
      .where(`${this.alias}.id = :userId`, { userId })
      .getRawOne();
    return result?.email ? this.cryptoService.decrypt(result.email) : null;
  }

  public async findPhoneById(userId: string): Promise<string | null> {
    const result = await this.createBaseQuery()
      .select(`${this.alias}.phone`, 'phone')
      .where(`${this.alias}.id = :userId`, { userId })
      .getRawOne();
    return result?.phone ? this.cryptoService.decrypt(result.phone) : null;
  }

  public async updateEmail(userId: string, email: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        email: this.cryptoService.encrypt(email),
        emailHash: this.cryptoService.hashForSearch(email),
      },
    );
  }

  public async updatePhone(userId: string, phone: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        phone: this.cryptoService.encrypt(phone),
        phoneHash: this.cryptoService.hashForSearch(phone),
      },
    );
  }

  public async updateCountryCode(
    userId: string,
    countryCode: string,
  ): Promise<void> {
    await this.repository.update({ id: userId }, { countryCode });
  }

  public async updateCountryIdd(
    userId: string,
    countryIdd: string,
  ): Promise<void> {
    await this.repository.update({ id: userId }, { countryIdd });
  }

  public findByApiKeyHash(apiKeyHash: string): Promise<User | null> {
    return this.createBaseQuery()
      .where(`${this.alias}.apiKeyHash = :apiKeyHash`, { apiKeyHash })
      .getOne();
  }
}
