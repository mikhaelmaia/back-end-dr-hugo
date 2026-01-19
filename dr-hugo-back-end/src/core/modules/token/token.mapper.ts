import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/core/base/base.mapper';
import { Token } from './entities/token.entity';
import { TokenDto } from './dtos/token.dto';

@Injectable()
export class TokenMapper extends BaseMapper<Token, TokenDto> {
  toDto(entity: Token): TokenDto {
    const tokenDto = new TokenDto();
    tokenDto.id = entity.id;
    tokenDto.token = entity.token;
    tokenDto.hash = entity.hash;
    tokenDto.type = entity.type;
    tokenDto.identification = entity.identification;
    tokenDto.createdAt = entity.createdAt;
    tokenDto.updatedAt = entity.updatedAt;
    return tokenDto;
  }

  toEntity(dto: Partial<TokenDto>): Token {
    const token = new Token();
    token.id = dto.id;
    token.token = dto.token;
    token.hash = dto.hash;
    token.type = dto.type;
    token.createdAt = dto.createdAt;
    token.updatedAt = dto.updatedAt;
    return token;
  }
}
