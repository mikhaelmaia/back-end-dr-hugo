import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer/types/decorators/expose.decorator";
import { IsEnum, IsNotEmpty, IsString, Length, MaxLength } from "class-validator";
import { BrazilianState } from "src/core/vo/consts/enums";
import { provideIsNotEmptyValidationMessage, provideIsStringValidationMessage, provideLengthValidationMessage, provideIsNotEmptyStringValidationMessage, provideMaxLengthValidationMessage, provideIsEnumValidationMessage } from "src/core/vo/consts/validation-messages";
import { IsNotBlacklisted } from "src/core/vo/validators/is-not-blacklisted.validator";
import { IsNotEmptyString } from "src/core/vo/validators/is-not-empty-string.validator";
import { IsOnlyLetters } from "src/core/vo/validators/is-only-letters.validator";
import { IsValidTaxId } from "src/core/vo/validators/is-valid-tax-id.validator";

export class CreateInstitutionCompanyRepresentativeDto {

    @IsNotEmpty({
        message: provideIsNotEmptyValidationMessage('Nome Completo'),
    })
    @IsString({ message: provideIsStringValidationMessage('Nome Completo') })
    @IsNotEmptyString({
        message: provideIsNotEmptyStringValidationMessage('Nome Completo'),
    })
    @IsOnlyLetters({
        message: 'Nome Completo deve conter apenas letras, espaços e caracteres básicos de pontuação',
    })
    @IsNotBlacklisted()
    @MaxLength(100, { message: provideMaxLengthValidationMessage('Nome Completo') })
    @Expose()
    @ApiProperty({ 
        description: 'Nome completo do paciente (apenas letras, espaços e pontuação básica)',
        example: 'Maria Silva Santos',
        maxLength: 100,
        type: String
    })
    public name: string;

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
    public state: BrazilianState;

}