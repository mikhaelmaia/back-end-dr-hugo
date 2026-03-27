import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PatientMedicalRecordDto } from 'src/modules/medical-records/dtos/medical-record.dto';
import { GrantedPatientDetailDto } from './granted-patient-detail.dto';

export class GrantedPatientMedicalRecordDto extends GrantedPatientDetailDto {
  @ApiPropertyOptional({
    description:
      'Prontuário médico do paciente. Pode ser nulo caso o paciente ainda não tenha preenchido a ficha.',
    type: PatientMedicalRecordDto,
    nullable: true,
  })
  @Type(() => PatientMedicalRecordDto)
  public medicalRecord: PatientMedicalRecordDto | null;
}
