import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/core/base/base.mapper';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';

@Injectable()
export class UserMapper extends BaseMapper<User, UserDto> {
  public toDto(entity: User): UserDto {
    const userDto = new UserDto();
    userDto.id = entity.id;
    userDto.name = entity.name;
    userDto.email = entity.email;
    userDto.password = entity.password;
    userDto.taxId = entity.taxId;
    userDto.phone = entity.phone;
    userDto.countryCode = entity.countryCode;
    userDto.countryIdd = entity.countryIdd;
    userDto.isActive = entity.isActive;
    userDto.acceptedTerms = entity.acceptedTerms;
    userDto.role = entity.role;
    userDto.createdAt = entity.createdAt;
    userDto.updatedAt = entity.updatedAt;
    return userDto;
  }

  public toEntity(dto: Partial<UserDto>): User {
    const user = new User();
    user.id = dto.id;
    user.name = dto.name;
    user.email = dto.email;
    user.password = dto.password;
    user.taxId = dto.taxId;
    user.phone = dto.phone;
    user.countryCode = dto.countryCode;
    user.countryIdd = dto.countryIdd;
    user.acceptedTerms = dto.acceptedTerms;
    user.role = dto.role;
    return user;
  }
}
