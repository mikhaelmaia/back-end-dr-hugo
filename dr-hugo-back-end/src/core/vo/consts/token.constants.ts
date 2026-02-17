import { TokenType } from './enums';

export abstract class TokenConstants {
  public static readonly TOKEN_TIMES = {
    [TokenType.PASSWORD_RESET]: {
      renewal: 180, // 3 minutos
      expiration: 900, // 15 minutos
    },
    [TokenType.EMAIL_CONFIRMATION]: {
      renewal: 180, // 3 minutos
      expiration: 86400, // 24 horas
    },
    [TokenType.USER_REQUEST_CHANGE]: {
      renewal: 5, // 5 segundos
      expiration: 3600, // 1 hora
    },
  } as const;

  public static readonly DEFAULT_TOKEN_LENGTH: number = 24;

  public static readonly ERROR_MESSAGES = {
    INVALID_TOKEN: () => 'Token inválido',
    TOKEN_WITH_IDENTIFIER_ALREADY_CREATED: (type: TokenType) =>
      `Aguarde ${Math.round(TokenConstants.getRenewalTimeSeconds(type) / 60)} minutos para gerar um novo código`,
    TOKEN_RENEWAL_TIME_NOT_REACHED: (type: TokenType) =>
      `Tempo de renovação ainda não atingido, aguarde ${Math.round(TokenConstants.getRenewalTimeSeconds(type) / 60)} minutos`,
    TOKEN_EXPIRED: () => 'Token expirado',
  } as const;

  public static getRenewalTimeSeconds(type: TokenType): number {
    return this.TOKEN_TIMES[type].renewal;
  }

  public static getExpirationTimeSeconds(type: TokenType): number {
    return this.TOKEN_TIMES[type].expiration;
  }
}
