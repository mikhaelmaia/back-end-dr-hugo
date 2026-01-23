import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenDto } from './dtos/token.dto';
import { Token } from './entities/token.entity';
import { TokenRepository } from './token.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BaseService } from 'src/core/base/base.service';
import { TokenMapper } from './token.mapper';
import { acceptTrueThrows, until } from 'src/core/utils/functions';
import { generateHash, generateSixDigitCode } from 'src/core/utils/utils';
import { TokenType } from 'src/core/vo/consts/enums';
import { Optional } from 'src/core/utils/optional';
import { TokenValidationDto } from './dtos/token-validation.dto';
import { TokenConstants } from 'src/core/vo/consts/token.constants';

@Injectable()
export class TokenService extends BaseService<
  Token,
  TokenDto,
  TokenRepository,
  TokenMapper
> {
  public constructor(
    tokenRepository: TokenRepository,
    tokenMapper: TokenMapper,
  ) {
    super(tokenRepository, tokenMapper);
  }

  public async generateToken(
    identification: string,
    type: TokenType,
  ): Promise<TokenDto> {
    acceptTrueThrows(
      await this.repository.existsByIdentificationAndType(identification, type),
      () =>
        new BadRequestException(
          TokenConstants.ERROR_MESSAGES.TOKEN_WITH_IDENTIFIER_ALREADY_CREATED(type),
        ),
    );
    
    return this.createAndSaveToken(identification, type);
  }

  public async validateToken(
    tokenCode: string,
    tokenIdentification: string,
    type: TokenType,
  ): Promise<TokenValidationDto> {
    const token: Token =
      await this.repository.findByTokenAndIdentificationAndType(
        tokenCode,
        tokenIdentification,
        type,
      );
    return Optional.ofNullable(token)
      .map((token) => this.mapper.toValidationDto(token))
      .orElseThrow(
        () => new BadRequestException({ message: TokenConstants.ERROR_MESSAGES.INVALID_TOKEN() }),
      );
  }

  public async concludeToken(
    hash: string,
    tokenIdentification: string,
    type: TokenType,
  ): Promise<void> {
    const token: Token = Optional.ofNullable(
      await this.repository.findByHashAndIdentificationAndType(
        hash,
        tokenIdentification,
        type,
      ),
    ).orElseThrow(
      () => new BadRequestException({ message: TokenConstants.ERROR_MESSAGES.INVALID_TOKEN() }),
    );
    await this.repository.delete(token.id);
  }

  public async renewToken(
    tokenIdentification: string,
    type: TokenType,
  ): Promise<TokenDto> {
    const existingToken: Token = Optional.ofNullable(
      await this.repository.findRenewableTokenByIdentificationAndType(
        tokenIdentification,
        type,
      ),
    ).orElseThrow(
      () => new BadRequestException(TokenConstants.ERROR_MESSAGES.TOKEN_RENEWAL_TIME_NOT_REACHED(type))
    );

    await this.repository.delete(existingToken.id);

    return this.createAndSaveToken(tokenIdentification, type);
  }

  private async createAndSaveToken(
    identification: string,
    type: TokenType,
  ): Promise<TokenDto> {
    const newToken = new Token();
    await until(
      async () => await this.repository.existsByTokenAndType(newToken.token, type),
      () => (newToken.token = generateSixDigitCode()),
    );
    await until(
      async () => await this.repository.existsByHashAndType(newToken.hash, type),
      () => (newToken.hash = generateHash(TokenConstants.DEFAULT_TOKEN_LENGTH)),
    );
    
    const now = new Date();
    newToken.type = type;
    newToken.identification = identification;
    newToken.renewalTime = new Date(now.getTime() + TokenConstants.getRenewalTimeMinutes(type) * 60 * 1000);
    newToken.expirationTime = new Date(now.getTime() + TokenConstants.getExpirationTimeMinutes(type) * 60 * 1000);
    
    return this.mapper.toDto(await this.repository.save(newToken));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async deleteExpiredTokens(): Promise<void> {
    await this.repository.deleteExpiredTokens();
  }
}
