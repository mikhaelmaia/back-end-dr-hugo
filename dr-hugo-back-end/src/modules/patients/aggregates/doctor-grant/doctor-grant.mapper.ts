import { Injectable } from '@nestjs/common';
import { PatientDoctorGrant } from '../permission-grant/entities/patient-doctor-grant.entity';
import { GrantedDoctorDetailDto } from './dtos/granted-doctor-detail.dto';
import { GrantedDoctorListItemDto } from './dtos/granted-doctor-list-item.dto';

@Injectable()
export class DoctorGrantMapper {
  public toListItem(grant: PatientDoctorGrant): GrantedDoctorListItemDto {
    const dto = new GrantedDoctorListItemDto();
    dto.grantId = grant.id;
    dto.doctorId = grant.doctor?.id;
    dto.name = grant.doctor?.user?.name;
    dto.liked = grant.likedByPatient ?? false;
    dto.specialties = (grant.doctor?.specializations ?? [])
      .filter((s) => s.isActive)
      .map((s) => s.name)
      .join(', ');
    dto.gender = grant.doctor?.gender;
    return dto;
  }

  public toDetail(grant: PatientDoctorGrant): GrantedDoctorDetailDto {
    const dto = new GrantedDoctorDetailDto();
    dto.grantId = grant.id;
    dto.doctorId = grant.doctor?.id;
    dto.name = grant.doctor?.user?.name;
    dto.liked = grant.likedByPatient ?? false;
    dto.specialties = (grant.doctor?.specializations ?? [])
      .filter((s) => s.isActive)
      .map((s) => s.name);
    dto.gender = grant.doctor?.gender;
    return dto;
  }
}
