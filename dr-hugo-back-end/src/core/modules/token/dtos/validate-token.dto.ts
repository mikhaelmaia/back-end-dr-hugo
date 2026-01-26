import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, Length, Matches } from 'class-validator';
import { TokenType } from 'src/core/vo/consts/enums';

/**
 * DTO para requisição de validação de token
 * Usado para validar tokens de acesso gerados para operações sensíveis
 */
export class ValidateTokenDto {
  @ApiProperty({
    description: 'Token de 6 dígitos gerado para o usuário',
    example: '123456',
    type: String,
    minLength: 6,
    maxLength: 6,
    pattern: '^[0-9]{6}$'
  })
  @IsString({ message: 'Token deve ser uma string' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @Length(6, 6, { message: 'Token deve ter exatamente 6 dígitos' })
  @Matches(/^[0-9]{6}$/, { message: 'Token deve conter apenas números' })
  public token: string;

  @ApiProperty({
    description: 'Identificação do usuário (e-mail ou ID) associada ao token',
    example: 'usuario@exemplo.com',
    type: String,
    maxLength: 255
  })
  @IsString({ message: 'Identificação deve ser uma string' })
  @IsNotEmpty({ message: 'Identificação é obrigatória' })
  public identification: string;

  @ApiProperty({
    description: 'Tipo de token a ser validado',
    enum: TokenType,
    enumName: 'TokenType',
    example: TokenType.PASSWORD_RESET
  })
  @IsEnum(TokenType, { message: 'Tipo de token inválido' })
  @IsNotEmpty({ message: 'Tipo do token é obrigatório' })
  public type: TokenType;
}