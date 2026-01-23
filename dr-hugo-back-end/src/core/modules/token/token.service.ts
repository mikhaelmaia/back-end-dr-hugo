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

@Injectable()
export class TokenService extends BaseService<
  Token,
  TokenDto,
  TokenRepository,
  TokenMapper
> {
  private readonly DEFAULT_TOKEN_LENGTH: number = 24;

  private readonly INVALID_TOKEN: string = 'Token inválido';

  private readonly TOKEN_WITH_IDENTIFIER_ALREADY_CREATED_WAIT_THREE_MINUTES: string =
    'Token com identificador já criado, aguarde 3 minutos';

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
    const token = new Token();
    acceptTrueThrows(
      await this.repository.existsByIdentificationAndType(identification, type),
      () =>
        new BadRequestException(
          this.TOKEN_WITH_IDENTIFIER_ALREADY_CREATED_WAIT_THREE_MINUTES,
        ),
    );
    await until(
      async () => await this.repository.existsByTokenAndType(token.token, type),
      () => (token.token = generateSixDigitCode()),
    );
    await until(
      async () => await this.repository.existsByHashAndType(token.hash, type),
      () => (token.hash = generateHash(this.DEFAULT_TOKEN_LENGTH)),
    );
    token.type = type;
    token.identification = identification;
    return this.mapper.toDto(await this.repository.save(token));
  }

  public async validateToken(
    tokenOrHash: string,
    tokenIdentification: string,
    type: TokenType,
  ): Promise<TokenValidationDto> {
    const token: Token =
      await this.repository.findByTokenOrHashAndIdentificationAndType(
        tokenOrHash,
        tokenIdentification,
        type,
      );
    return Optional.ofNullable(token)
      .map((token) => this.mapper.toValidationDto(token))
      .orElseThrow(
        () => new BadRequestException({ message: this.INVALID_TOKEN }),
      );
  }

  public async concludeToken(
    tokenOrHash: string,
    tokenIdentification: string,
    type: TokenType,
  ): Promise<void> {
    const token: Token = Optional.ofNullable(
      await this.repository.findByTokenOrHashAndIdentificationAndType(
        tokenOrHash,
        tokenIdentification,
        type,
      ),
    ).orElseThrow(
      () => new BadRequestException({ message: this.INVALID_TOKEN }),
    );
    await this.repository.delete(token.id);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  public async deleteExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.repository.deleteExpiredTokens(
      new Date(now.getTime() - 3 * 60 * 1000),
    );
  }
}
