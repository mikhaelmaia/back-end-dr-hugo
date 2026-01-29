import { IsNotEmpty, IsString, IsBoolean, IsArray, IsEnum, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BrazilianState } from 'src/core/vo/consts/enums';
import {
  provideIsNotEmptyValidationMessage,
  provideIsStringValidationMessage,
  provideIsBooleanValidationMessage,
  provideIsArrayValidationMessage,
  provideLengthValidationMessage,
  provideIsEnumValidationMessage
} from 'src/core/vo/consts/validation-messages';
import { IsNotEmptyString } from 'src/core/vo/validators/is-not-empty-string.validator';
import { IsValidTaxId } from 'src/core/vo/validators/is-valid-tax-id.validator';

export class DoctorRegistrationValidationDto {

    @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('CPF') })
    @IsString({ message: provideIsStringValidationMessage('CPF') })
    @IsNotEmptyString({ message: 'CPF é obrigatório' })
    @Length(11, 14, { message: provideLengthValidationMessage('CPF') })
    @IsValidTaxId({ message: 'CPF deve ser válido' })
    @ApiProperty({
        description: 'CPF do médico para validação no CRM',
        example: '12345678901',
        minLength: 11,
        maxLength: 14,
        type: String
    })
    public taxId: string;

    @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('CRM') })
    @IsString({ message: provideIsStringValidationMessage('CRM') })
    @IsNotEmptyString({ message: 'CRM é obrigatório' })
    @Length(1, 20, { message: provideLengthValidationMessage('CRM') })
    @ApiProperty({
        description: 'Número do CRM do médico',
        example: '123456',
        minLength: 1,
        maxLength: 20,
        type: String
    })
    public crm: string;

    @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('UF') })
    @IsEnum(BrazilianState, { message: (args) => provideIsEnumValidationMessage(args, BrazilianState) })
    @ApiProperty({
        description: 'Estado brasileiro onde o CRM foi emitido',
        enum: BrazilianState,
        example: BrazilianState.SP
    })
    public uf: BrazilianState;

    @IsNotEmpty({ message: provideIsNotEmptyValidationMessage('É Generalista') })
    @IsBoolean({ message: provideIsBooleanValidationMessage('É Generalista') })
    @ApiProperty({
        description: 'Indica se o médico é generalista ou especialista',
        example: false,
        type: Boolean
    })
    public isGeneralist: boolean;

    @IsArray({ message: provideIsArrayValidationMessage('Especialidades') })
    @ApiProperty({
        description: 'Lista de especialidades do médico (obrigatório quando não é generalista)',
        type: [String],
        example: ['CARDIOLOGY', 'INTERNAL_MEDICINE'],
        required: false
    })
    public specialties: string[];

}