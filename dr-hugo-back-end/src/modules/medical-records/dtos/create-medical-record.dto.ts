import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MedicalRecordConditionDto } from './medical-record-condition.dto';
import { MedicalRecordBloodPressureDto } from './medical-record-blood-pressure.dto';
import { MedicalRecordSmokingDto } from './medical-record-smoking.dto';
import { TermsType } from 'src/core/vo/consts/enums';
import { provideIsNotEmptyValidationMessage } from 'src/core/vo/consts/validation-messages';
import { ContainsRequiredTerms } from 'src/core/vo/validators/contains-required-terms.validator';

export class CreatePatientMedicalRecordDto {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Alergias'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @ApiProperty({
    description: 'Informações sobre alergias do paciente',
    type: () => MedicalRecordConditionDto,
  })
  public allergies: MedicalRecordConditionDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Doenças Crônicas'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @ApiProperty({
    description:
      'Informações sobre doenças crônicas do paciente (ex: diabetes, hipertensão, asma)',
    type: () => MedicalRecordConditionDto,
  })
  public chronic_diseases: MedicalRecordConditionDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Cirurgias'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @ApiProperty({
    description: 'Histórico de cirurgias realizadas pelo paciente',
    type: () => MedicalRecordConditionDto,
  })
  public surgeries: MedicalRecordConditionDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tratamento Médico'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @ApiProperty({
    description: 'Informações sobre tratamentos médicos em andamento',
    type: () => MedicalRecordConditionDto,
  })
  public medical_treatment: MedicalRecordConditionDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Medicamentos'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @ApiProperty({
    description: 'Informações sobre medicamentos em uso pelo paciente',
    type: () => MedicalRecordConditionDto,
  })
  public medications: MedicalRecordConditionDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Pressão Arterial'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordBloodPressureDto)
  @ApiProperty({
    description: 'Valores usuais de pressão arterial do paciente',
    type: () => MedicalRecordBloodPressureDto,
  })
  public blood_pressure: MedicalRecordBloodPressureDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Insônia'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @ApiProperty({
    description: 'Informações sobre insônia e dificuldades para dormir',
    type: () => MedicalRecordConditionDto,
  })
  public insomnia: MedicalRecordConditionDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Hábitos de Fumo'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordSmokingDto)
  @ApiProperty({
    description: 'Informações sobre hábitos de fumo do paciente',
    type: () => MedicalRecordSmokingDto,
  })
  public smoking: MedicalRecordSmokingDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Álcool'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @ApiProperty({
    description: 'Informações sobre consumo de bebidas alcoólicas',
    type: () => MedicalRecordConditionDto,
  })
  public alcohol: MedicalRecordConditionDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Atividade Física'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @ApiProperty({
    description: 'Informações sobre prática de atividades físicas regulares',
    type: () => MedicalRecordConditionDto,
  })
  public physical_activity: MedicalRecordConditionDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Termos Aceitos'),
  })
  @IsArray({ message: 'Termos aceitos deve ser um array' })
  @ContainsRequiredTerms(
    [TermsType.PRIVACY_POLICY, TermsType.TERMS_OF_SERVICE],
    {
      message:
        'Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar',
    },
  )
  @ApiProperty({
    description:
      'Lista dos tipos de termos aceitos pelo paciente (obrigatórios: privacy_policy, terms_of_service)',
    type: [String],
    example: ['privacy_policy', 'terms_of_service'],
    items: {
      type: 'string',
      enum: ['privacy_policy', 'terms_of_service'],
    },
  })
  public acceptedTerms: string[];
}
