import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from '../../../base/base.entity.dto';
import { Address } from '../entities/address.entity';
import { provideIsNotEmptyValidationMessage, provideIsStringValidationMessage, provideLengthValidationMessage, provideIsEnumValidationMessage } from 'src/core/vo/consts/validation-messages';
import { BrazilianState } from 'src/core/vo/consts/enums';

export class AddressDto extends BaseEntityDto<Address> {
  @ApiProperty({
    description: 'Nome da rua ou logradouro',
    example: 'Rua das Flores',
    maxLength: 255,
    type: String
  })
  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Rua') })
  @IsString({ message: provideIsStringValidationMessage('Rua') })
  @Length(1, 255, { message: provideLengthValidationMessage('Rua') })
  @Expose()
  public street: string;

  @ApiProperty({
    description: 'Número do endereço',
    example: '123',
    maxLength: 20,
    type: String
  })
  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Número') })
  @IsString({ message: provideIsStringValidationMessage('Número') })
  @Length(1, 20, { message: provideLengthValidationMessage('Número') })
  @Expose()
  public number: string;

  @ApiProperty({
    description: 'Complemento do endereço (opcional)',
    example: 'Apto 101',
    maxLength: 100,
    required: false,
    type: String
  })
  @IsOptional()
  @IsString({ message: provideIsStringValidationMessage('Complemento') })
  @Length(0, 100, { message: provideLengthValidationMessage('Complemento') })
  @Expose()
  public complement?: string;

  @ApiProperty({
    description: 'Nome do bairro',
    example: 'Centro',
    maxLength: 100,
    type: String
  })
  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Bairro') })
  @IsString({ message: provideIsStringValidationMessage('Bairro') })
  @Length(1, 100, { message: provideLengthValidationMessage('Bairro') })
  @Expose()
  public neighborhood: string;

  @ApiProperty({
    description: 'Nome da cidade',
    example: 'São Paulo',
    maxLength: 100,
    type: String
  })
  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Cidade') })
  @IsString({ message: provideIsStringValidationMessage('Cidade') })
  @Length(1, 100, { message: provideLengthValidationMessage('Cidade') })
  @Expose()
  public city: string;

  @ApiProperty({
    description: 'Estado brasileiro',
    example: BrazilianState.SP,
    enum: BrazilianState,
    type: String
  })
  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('Estado') })
  @IsEnum(BrazilianState, { message: (args) => provideIsEnumValidationMessage(args, BrazilianState) })
  @Expose()
  public state: BrazilianState;

  @ApiProperty({
    description: 'CEP (apenas números)',
    example: '01234567',
    pattern: '^[0-9]{8}$',
    type: String
  })
  @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('CEP') })
  @IsString({ message: provideIsStringValidationMessage('CEP') })
  @Matches(/^\d{8}$/, { message: 'CEP deve conter exatamente 8 dígitos' })
  @Expose()
  public zipCode: string;

  @ApiProperty({
    description: 'Nome do país',
    example: 'Brasil',
    default: 'Brasil',
    maxLength: 100,
    type: String
  })
  @IsOptional()
  @IsString({ message: provideIsStringValidationMessage('País') })
  @Length(1, 100, { message: provideLengthValidationMessage('País') })
  @Expose()
  public country?: string;
}