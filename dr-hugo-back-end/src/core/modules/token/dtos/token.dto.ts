import { ApiProperty } from '@nestjs/swagger';
import { Token } from '../entities/token.entity';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { TokenType } from 'src/core/vo/consts/enums';

/**
 * DTO para representação de token de acesso
 * Contém informações sobre tokens gerados para validação de operações sensíveis
 */
export class TokenDto extends BaseEntityDto<Token> {
  @ApiProperty({ 
    description: 'Código numérico de 6 dígitos para validação do usuário',
    example: '123456',
    type: String,
    minLength: 6,
    maxLength: 6,
    pattern: '^[0-9]{6}$',
    required: false 
  })
  public token: string;

  @ApiProperty({ 
    description: 'Hash único gerado para o token, usado para identificação interna',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    type: String,
    minLength: 24,
    maxLength: 50,
    required: false 
  })
  public hash: string;

  @ApiProperty({ 
    description: 'Tipo de operação para qual o token foi gerado',
    enum: TokenType,
    enumName: 'TokenType',
    example: TokenType.PASSWORD_RESET,
    required: false 
  })
  public type: TokenType;

  @ApiProperty({ 
    description: 'Identificação do usuário associado ao token (e-mail, ID, etc.)',
    example: 'usuario@exemplo.com',
    type: String,
    maxLength: 255,
    required: false 
  })
  public identification: string;

  @ApiProperty({ 
    description: 'Data e hora em que o token pode ser renovado',
    example: '2024-01-15T10:30:00.000Z',
    type: Date,
    required: false 
  })
  public renewalTime: Date;

  @ApiProperty({ 
    description: 'Data e hora em que o token expira definitivamente',
    example: '2024-01-15T10:45:00.000Z',
    type: Date,
    required: false 
  })
  public expirationTime: Date;
}
