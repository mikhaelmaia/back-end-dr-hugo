import { Token } from './entities/token.entity';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenType } from 'src/core/vo/consts/enums';

@Injectable()
export class TokenRepository extends BaseRepository<Token> {
  protected override alias = 'token';

  public constructor(
    @InjectRepository(Token)
    tokenRepository: Repository<Token>,
  ) {
    super(tokenRepository);
  }

  public findByTokenOrHashAndIdentificationAndType(
    tokenOrHash: string,
    identification: string,
    type: TokenType,
  ): Promise<Token> {
    return this.createBaseQuery()
      .where(
        'token.token = :tokenOrHash OR token.hash = :tokenOrHash AND token.identification = :identification AND token.type = :type',
        {
          tokenOrHash: tokenOrHash,
          identification: identification,
          type: type,
        },
      )
      .getOne();
  }

  public existsByIdentificationAndType(
    identification: string,
    type: TokenType,
  ): Promise<boolean> {
    return this.createBaseQuery()
      .where('token.identification = :identification AND token.type = :type', {
        identification: identification,
        type: type,
      })
      .getCount()
      .then((count) => count > 0);
  }

  public existsByTokenAndType(
    token: string,
    type: TokenType,
  ): Promise<boolean> {
    return this.createBaseQuery()
      .where('token.token = :token AND token.type = :type', {
        token: token,
        type: type,
      })
      .getCount()
      .then((count) => count > 0);
  }

  public existsByHashAndType(hash: string, type: TokenType): Promise<boolean> {
    return this.createBaseQuery()
      .where('token.hash = :hash AND token.type = :type', {
        hash: hash,
        type: type,
      })
      .getCount()
      .then((count) => count > 0);
  }

  public findByHashAndType(hash: string, type: TokenType): Promise<Token> {
    return this.createBaseQuery()
      .where('token.hash = :hash AND token.type = :type', {
        hash: hash,
        type: type,
      })
      .getOne();
  }

  public async deleteExpiredTokens(expiredDate: Date): Promise<void> {
    await this.createBaseQuery()
      .delete()
      .from(Token)
      .where('created_at < :expiredDate', { expiredDate })
      .execute();
  }
}
