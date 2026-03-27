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
    dto.name = entity.user?.name;
    dto.email = entity.user?.email;
    dto.taxId = entity.user?.taxId;
    dto.phone = entity.user?.phone;
    dto.countryCode = entity.user?.countryCode;
    dto.countryIdd = entity.user?.countryIdd;
    dto.profilePictureId = entity.user?.profilePicture?.id;
    dto.acceptedTerms = entity.user?.acceptedTerms;
    dto.birthDate = entity.birthDate;
    dto.gender = entity.gender;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  public toEntity(dto: Partial<PatientDto>): Patient {
    const entity = new Patient();
    entity.id = dto.id;
    entity.birthDate = dto.birthDate;
    entity.gender = dto.gender;
    return entity;
  }

  public toDtoWithUser(patient: Patient, user: UserDto | User): PatientDto {
    const dto = this.toDto(patient);
    dto.name = user.name;
    dto.email = user.email;
    dto.taxId = user.taxId;
    dto.phone = user.phone;
    dto.countryCode = user.countryCode;
    dto.countryIdd = user.countryIdd;
    dto.profilePictureId =
      user instanceof User ? user.profilePicture?.id : user.profilePictureId;
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
    userDto.name = dto.name;
    userDto.email = dto.email;
    userDto.taxId = dto.taxId;
    userDto.password = dto.password;
    userDto.phone = dto.phone;
    userDto.countryCode = dto.countryCode;
    userDto.countryIdd = dto.countryIdd;
    userDto.role = UserRole.PATIENT;
    userDto.profilePictureId = dto.profilePictureId;
    userDto.acceptedTerms = dto.acceptedTerms;
    return userDto;
  }
}
