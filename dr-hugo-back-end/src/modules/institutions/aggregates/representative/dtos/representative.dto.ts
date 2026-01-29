import {
  IsNotEmpty,
  IsString,
  IsEnum,
  Length,
  MaxLength,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { InstitutionCompanyRepresentative } from '../entities/representative.entity';
import { BrazilianState } from 'src/core/vo/consts/enums';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideIsValidTaxIdValidationMessage,
  provideLengthValidationMessage,
  provideMaxLengthValidationMessage,
  provideIsEnumValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsValidTaxId } from 'src/core/vo/validators/is-valid-tax-id.validator';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';
import { IsOnlyLetters } from 'src/core/vo/validators/is-only-letters.validator';
import { IsUnique } from 'src/core/vo/validators/is-unique.validator';

export class RepresentativeDto extends BaseEntityDto<InstitutionCompanyRepresentative> {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Nome do Representante'),
  })
  @IsString({ 
    message: provideIsStringValidationMessage('Nome do Representante') 
  })
  @IsNotEmptyString({
    message: provideIsNotEmptyValidationMessage('Nome do Representante'),
  })
  @IsOnlyLetters({
    message: 'Nome do representante deve conter apenas letras, espaços e caracteres básicos de pontuação',
  })
  @MaxLength(255, { 
    message: provideMaxLengthValidationMessage('Nome do Representante') 
  })
  @Expose()
  @ApiProperty({
    description: 'Nome completo do representante legal da empresa',
    example: 'Dr. João Silva Santos',
    maxLength: 255,
    type: String
  })
  public name: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('CPF/CNPJ do Representante'),
  })
  @IsString({
    message: provideIsStringValidationMessage('CPF/CNPJ do Representante'),
  })
  @Length(11, 14, {
    message: provideLengthValidationMessage('CPF/CNPJ do Representante'),
  })
  @IsNotEmptyString({
    message: provideIsNotEmptyValidationMessage('CPF/CNPJ do Representante'),
  })
  @IsValidTaxId({
    message: provideIsValidTaxIdValidationMessage('CPF/CNPJ do Representante'),
  })
  @IsUnique('dv_institution_company_representative', 'tax_id', {
    message: 'Já existe representante com este CPF/CNPJ cadastrado',
  })
  @ApiProperty({
    description: 'CPF ou CNPJ do representante legal (apenas números)',
    example: '12345678901',
    minLength: 11,
    maxLength: 14,
    type: String
  })
  public taxId: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('CRM do Representante'),
  })
  @IsString({
    message: provideIsStringValidationMessage('CRM do Representante'),
  })
  @IsNotEmptyString({
    message: provideIsNotEmptyValidationMessage('CRM do Representante'),
  })
  @MaxLength(20, {
    message: provideMaxLengthValidationMessage('CRM do Representante'),
  })
  @IsUnique('dv_institution_company_representative', 'crm', {
    message: 'Já existe representante com este CRM cadastrado',
  })
  @ApiProperty({
    description: 'Número do registro no Conselho Regional de Medicina (CRM)',
    example: 'CRM/SP-123456',
    maxLength: 20,
    type: String
  })
  public crm: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Estado do CRM'),
  })
  @IsEnum(BrazilianState, {
    message: provideIsEnumValidationMessage('Estado do CRM', BrazilianState),
  })
  @ApiProperty({
    description: 'Estado onde o CRM foi emitido',
    example: 'SP',
    enum: BrazilianState,
    enumName: 'BrazilianState',
    type: String
  })
  public state: BrazilianState;
}
