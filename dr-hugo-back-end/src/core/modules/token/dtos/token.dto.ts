import { ApiProperty } from '@nestjs/swagger';
import { Token } from '../entities/token.entity';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { TokenType } from 'src/core/vo/consts/enums';

export class TokenDto extends BaseEntityDto<Token> {
  @ApiProperty({ description: 'Token de acesso', required: false })
  public token: string;

  @ApiProperty({ description: 'Hash do token', required: false })
  public hash: string;

  @ApiProperty({ description: 'Tipo do token', required: false })
  public type: TokenType;

  @ApiProperty({ description: 'Identificação do token', required: false })
  public identification: string;
}
