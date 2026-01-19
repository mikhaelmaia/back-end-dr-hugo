import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/core/base/base.mapper';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dtos/patient.dto';
import { UserMapper } from '../users/user.mapper';

@Injectable()
export class PatientsMapper extends BaseMapper<Patient, PatientDto> {
  public constructor(private readonly userMapper: UserMapper) {
    super();
  }

  public toDto(entity: Patient): PatientDto {
    const dto = new PatientDto();
    dto.id = entity.id;
    dto.user = this.userMapper.toDto(entity.user);
    dto.birthDate = entity.birthDate?.toISOString().split('T')[0];
    dto.emergencyPhone = entity.emergencyPhone;
    dto.acceptedTerms = entity.acceptedTerms;
    dto.profilePictureId = entity.profilePicture?.id;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  public toEntity(dto: Partial<PatientDto>): Patient {
    const entity = new Patient();
    entity.id = dto.id;

    if (dto.user) {
      entity.user = this.userMapper.toEntity(dto.user);
    }

    if (dto.birthDate) {
      entity.birthDate = new Date(dto.birthDate);
    }

    entity.emergencyPhone = dto.emergencyPhone;
    entity.acceptedTerms = dto.acceptedTerms;

    return entity;
  }

  public toDtos(entities: Patient[]): PatientDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}
