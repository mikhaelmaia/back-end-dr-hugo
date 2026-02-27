import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CheckCnesDto {
  @ApiProperty({
    description:
      'Código Nacional de Estabelecimentos de Saúde (CNES) para verificação - 7 dígitos',
    example: '1234567',
    minLength: 7,
    maxLength: 7,
  })
  @IsString({
    message: 'CNES deve ser uma string',
  })
  @IsNotEmpty({
    message: 'CNES é obrigatório',
  })
  @Length(7, 7, {
    message: 'CNES deve ter exatamente 7 caracteres',
  })
  public cnes: string;
}
