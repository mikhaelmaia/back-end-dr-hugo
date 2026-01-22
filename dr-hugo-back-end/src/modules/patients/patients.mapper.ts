import { Injectable } from '@nestjs/common';
import { BaseMapper } from 'src/core/base/base.mapper';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dtos/patient.dto';
import { UserDto } from '../users/dtos/user.dto';
import { UserRole } from 'src/core/vo/consts/enums';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PatientsMapper extends BaseMapper<Patient, PatientDto> {

  public toDto(entity: Patient): PatientDto {
    const dto = new PatientDto();
    dto.id = entity.id;
    dto.birthDate = entity.birthDate;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  public toEntity(dto: Partial<PatientDto>): Patient {
    const entity = new Patient();
    entity.id = dto.id;
    entity.birthDate = dto.birthDate;
    return entity;
  }

  public toDtoWithUser(patient: Patient, user: UserDto | User): PatientDto {
    const dto = this.toDto(patient);
    dto.userId = user.id;
    dto.name = user.name;
    dto.email = user.email;
    dto.taxId = user.taxId;
    dto.profilePictureId = user instanceof User ? user.profilePicture?.id : user.profilePictureId;
    dto.acceptedTerms = user.acceptedTerms;
    return dto;
  }

  public toEntityAndUser(dto: Partial<PatientDto>): [Patient, UserDto] {
    const patientEntity = this.toEntity(dto);
    const userDto = this.mapPatientDtoToUserDto(dto as PatientDto);
    return [patientEntity, userDto];
  }

  public toDtos(entities: Patient[]): PatientDto[] {
    return entities.map((entity) => this.toDto(entity));
  }

  private mapPatientDtoToUserDto(dto: PatientDto): UserDto {
    const userDto = new UserDto();
    userDto.id = dto.userId;
    userDto.name = dto.name;
    userDto.email = dto.email;
    userDto.taxId = dto.taxId;
    userDto.password = dto.password;
    userDto.role = UserRole.PATIENT;
    userDto.profilePictureId = dto.profilePictureId;
    userDto.acceptedTerms = dto.acceptedTerms;
    return userDto;
  }
}
