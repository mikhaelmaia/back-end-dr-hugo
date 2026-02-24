import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsNotEmpty } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { PatientMedicalRecord } from '../entities/medical-record.entity';
import { MedicalRecordConditionDto } from './medical-record-condition.dto';
import { MedicalRecordBloodPressureDto } from './medical-record-blood-pressure.dto';
import { MedicalRecordSmokingDto } from './medical-record-smoking.dto';
import { MedicalRecordPhysicalActivityDto } from './medical-record-physical-activity.dto';
import { provideIsNotEmptyValidationMessage } from 'src/core/vo/consts/validation-messages';

export class PatientMedicalRecordDto extends BaseEntityDto<PatientMedicalRecord> {
  @ApiProperty({
    description: 'Informações sobre alergias do paciente',
    type: MedicalRecordConditionDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Alergias'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @Expose()
  allergies: MedicalRecordConditionDto;

  @ApiProperty({
    description:
      'Informações sobre doenças crônicas do paciente (ex: diabetes, hipertensão, asma)',
    type: MedicalRecordConditionDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Doenças Crônicas'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @Expose()
  chronicDiseases: MedicalRecordConditionDto;

  @ApiProperty({
    description: 'Histórico de cirurgias realizadas pelo paciente',
    type: MedicalRecordConditionDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Cirurgias'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @Expose()
  surgeries: MedicalRecordConditionDto;

  @ApiProperty({
    description: 'Informações sobre tratamentos médicos em andamento',
    type: MedicalRecordConditionDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Tratamento Médico'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @Expose()
  medicalTreatment: MedicalRecordConditionDto;

  @ApiProperty({
    description: 'Informações sobre medicamentos em uso pelo paciente',
    type: MedicalRecordConditionDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Medicamentos'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @Expose()
  medications: MedicalRecordConditionDto;

  @ApiProperty({
    description: 'Valores usuais de pressão arterial do paciente',
    type: MedicalRecordBloodPressureDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Pressão Arterial'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordBloodPressureDto)
  @Expose()
  bloodPressure: MedicalRecordBloodPressureDto;

  @ApiProperty({
    description: 'Informações sobre insônia e dificuldades para dormir',
    type: MedicalRecordConditionDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Insônia'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @Expose()
  insomnia: MedicalRecordConditionDto;

  @ApiProperty({
    description: 'Informações sobre hábitos de fumo do paciente',
    type: MedicalRecordSmokingDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Hábitos de Fumo'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordSmokingDto)
  @Expose()
  smoking: MedicalRecordSmokingDto;

  @ApiProperty({
    description: 'Informações sobre consumo de bebidas alcoólicas',
    type: MedicalRecordConditionDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Álcool'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordConditionDto)
  @Expose()
  alcohol: MedicalRecordConditionDto;

  @ApiProperty({
    description: 'Informações sobre prática de atividades físicas regulares',
    type: MedicalRecordPhysicalActivityDto,
  })
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Atividade Física'),
  })
  @ValidateNested()
  @Type(() => MedicalRecordPhysicalActivityDto)
  @Expose()
  physicalActivity: MedicalRecordPhysicalActivityDto;
}
