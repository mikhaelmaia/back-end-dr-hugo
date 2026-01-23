import { TokenType } from './enums';

export abstract class TokenConstants {
  public static readonly TOKEN_TIMES = {
    [TokenType.PASSWORD_RESET]: {
      renewal: 3,
      expiration: 15
    },
    [TokenType.EMAIL_CONFIRMATION]: {
      renewal: 3,
      expiration: 1440
    }
  } as const;

  public static readonly DEFAULT_TOKEN_LENGTH: number = 24;

  public static readonly ERROR_MESSAGES = {
    INVALID_TOKEN: () => 'Token inválido',
    TOKEN_WITH_IDENTIFIER_ALREADY_CREATED: (type: TokenType) => 
      `Aguarde ${TokenConstants.getRenewalTimeMinutes(type)} minutos para gerar um novo código`,
    TOKEN_RENEWAL_TIME_NOT_REACHED: (type: TokenType) => 
      `Tempo de renovação ainda não atingido, aguarde ${TokenConstants.getRenewalTimeMinutes(type)} minutos`,
    TOKEN_EXPIRED: () => 'Token expirado'
  } as const;

  public static getRenewalTimeMinutes(type: TokenType): number {
    return this.TOKEN_TIMES[type].renewal;
  }

  public static getExpirationTimeMinutes(type: TokenType): number {
    return this.TOKEN_TIMES[type].expiration;
  }
}