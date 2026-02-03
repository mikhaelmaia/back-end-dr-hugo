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

  public findByTokenAndIdentificationAndType(
    token: string,
    identification: string,
    type: TokenType,
  ): Promise<Token> {
    return this.createBaseQuery()
      .where(
        'token.token = :token AND token.identification = :identification AND token.type = :type',
        {
          token: token,
          identification: identification,
          type: type,
        },
      )
      .getOne();
  }

  public async findByHashAndIdentificationAndType(
    hash: string,
    identification: string,
    type: TokenType,
  ): Promise<Token> {
    return this.createBaseQuery()
      .where(
        'token.hash = :hash AND token.identification = :identification AND token.type = :type',
        {
          hash: hash,
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
    const now = new Date();
    return this.createBaseQuery()
      .where(
        'token.identification = :identification AND token.type = :type AND token.expiration_time > :now',
        {
          identification: identification,
          type: type,
          now: now,
        },
      )
      .getCount()
      .then((count) => count > 0);
  }

  public findActiveTokenByIdentificationAndType(
    identification: string,
    type: TokenType,
  ): Promise<Token> {
    const now = new Date();
    return this.createBaseQuery()
      .where(
        'token.identification = :identification AND token.type = :type AND token.expiration_time > :now',
        {
          identification: identification,
          type: type,
          now: now,
        },
      )
      .getOne();
  }

  public findRenewableTokenByIdentificationAndType(
    identification: string,
    type: TokenType,
  ): Promise<Token> {
    const now = new Date();
    return this.createBaseQuery()
      .where(
        'token.identification = :identification AND token.type = :type AND token.renewal_time <= :now AND token.expiration_time > :now',
        {
          identification: identification,
          type: type,
          now: now,
        },
      )
      .getOne();
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

  public async deleteExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.createBaseQuery()
      .delete()
      .from(Token)
      .where('expiration_time <= :now', { now })
      .execute();
  }
}
