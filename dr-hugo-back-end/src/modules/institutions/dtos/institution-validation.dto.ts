import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { IsUniqueComposite } from 'src/core/vo/validators/is-unique-composite.validator';
import { IsValidTaxId } from 'src/core/vo/validators/is-valid-tax-id.validator';

export class InstitutionValidationDto {
  @ApiProperty({
    description: 'CNPJ da instituição para validação',
    example: '12345678901234',
    minLength: 14,
    maxLength: 14,
  })
  @IsString()
  @IsNotEmpty()
  @IsValidTaxId({
    message: 'Deve ser um CNPJ válido.',
  })
  @IsUniqueComposite(
    {
      tableName: 'dv_user',
      column: 'taxId',
      additionalField: { column: 'role', value: 'INSTITUTION' },
    },
    {
      message: 'Já existe instituição com este CNPJ cadastrado',
    },
  )
  public taxId: string;
}
