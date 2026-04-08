import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/core/base/base.mapper';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';
import { CryptoService } from 'src/core/modules/crypto/crypto.service';

@Injectable()
export class UserMapper extends BaseMapper<User, UserDto> {
  public constructor(private readonly cryptoService: CryptoService) {
    super();
  }

  public hashForSearch(value: string): string {
    return this.cryptoService.hashForSearch(value);
  }

  public toDto(entity: User): UserDto {
    const userDto = new UserDto();
    userDto.id = entity.id;
    userDto.name = entity.name;
    userDto.email = entity.email
      ? this.cryptoService.decrypt(entity.email)
      : entity.email;
    userDto.password = entity.password;
    userDto.taxId = entity.taxId
      ? this.cryptoService.decrypt(entity.taxId)
      : entity.taxId;
    userDto.phone = entity.phone
      ? this.cryptoService.decrypt(entity.phone)
      : entity.phone;
    userDto.countryCode = entity.countryCode;
    userDto.countryIdd = entity.countryIdd;
    userDto.isActive = entity.isActive;
    userDto.isValid = entity.isValid;
    userDto.acceptedTerms = entity.acceptedTerms;
    userDto.apiKey = entity.apiKey
      ? this.cryptoService.decrypt(entity.apiKey)
      : entity.apiKey;
    userDto.role = entity.role;
    userDto.createdAt = entity.createdAt;
    userDto.updatedAt = entity.updatedAt;
    return userDto;
  }

  public toEntity(dto: Partial<UserDto>): User {
    const user = new User();
    user.id = dto.id;
    user.name = dto.name;
    if (dto.email !== undefined && dto.email !== null) {
      user.email = this.cryptoService.encrypt(dto.email);
      user.emailHash = this.cryptoService.hashForSearch(dto.email);
    }
    user.password = dto.password;
    if (dto.taxId !== undefined && dto.taxId !== null) {
      user.taxId = this.cryptoService.encrypt(dto.taxId);
      user.taxIdHash = this.cryptoService.hashForSearch(dto.taxId);
    }
    if (dto.phone !== undefined && dto.phone !== null) {
      user.phone = this.cryptoService.encrypt(dto.phone);
      user.phoneHash = this.cryptoService.hashForSearch(dto.phone);
    }
    user.countryCode = dto.countryCode;
    user.countryIdd = dto.countryIdd;
    user.isValid = dto.isValid;
    user.acceptedTerms = dto.acceptedTerms;
    if (dto.apiKey !== undefined && dto.apiKey !== null) {
      user.apiKey = this.cryptoService.encrypt(dto.apiKey);
      user.apiKeyHash = this.cryptoService.hashForSearch(dto.apiKey);
    }
    user.role = dto.role;
    return user;
  }
}
