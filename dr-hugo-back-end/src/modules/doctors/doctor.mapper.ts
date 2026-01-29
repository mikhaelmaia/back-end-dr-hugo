import { Injectable } from "@nestjs/common";
import { BaseMapper } from "src/core/base/base.mapper";
import { DoctorDto } from "./dtos/doctor.dto";
import { Doctor } from "./entities/doctor.entity";
import { CreateDoctorDto } from "./dtos/create-doctor.dto";
import { UserDto } from "../users/dtos/user.dto";
import { BrazilianState, DoctorRegistrationType, DoctorSituation, UserRole } from "src/core/vo/consts/enums";
import { DoctorRegistrationData, DoctorRegistrationValidatedDto } from "./dtos/doctor-registration-validated.dto";
import { DoctorRegistration } from "./aggregates/registration/entities/doctor-registration.entity";
import { DoctorSpecializationDto } from "./aggregates/specialization/dtos/doctor-specialization.dto";
import { DoctorSpecialization } from "./aggregates/specialization/entities/doctor-specialization.entity";
import { findEnumByKeyValue } from "src/core/utils/enum.utils";
import { stringToLocalDate } from "src/core/utils/date-time.utils";

@Injectable()
export class DoctorMapper extends BaseMapper<Doctor, DoctorDto> {
    
    public toDto(entity: Doctor): DoctorDto {
        throw new Error("Method not implemented.");
    }

    public toEntity(dto: Partial<DoctorDto>): Doctor {
        throw new Error("Method not implemented.");
    }

    public mapCreationDtoToEntityAndUser(dto: CreateDoctorDto): [ Doctor, UserDto ] {
        const entity = new Doctor();

        entity.birthDate = dto.birthDate;

        const user = new UserDto();
        user.email = dto.email;
        user.password = dto.password;
        user.taxId = dto.taxId;
        user.phone = dto.phone;
        user.countryCode = dto.countryCode;
        user.countryIdd = dto.countryIdd;
        user.role = UserRole.DOCTOR;

        return [ entity, user ];
    }

    public mapValidatedToDoctor(doctorValidatedDto: DoctorRegistrationValidatedDto): Doctor {
        const doctorData = doctorValidatedDto.data;

        const doctor = new Doctor();
        doctor.isGeneralist = doctorData.isGeneralist;
        
        const registration = this.mapRegistrationToDoctorRegistrationEntity(doctorData);
        doctor.registration = registration;

        const specialties = this.mapSpecialtiesDtosToEntities(doctorData.specialties);
        doctor.specializations = specialties;

        return doctor;
    }

    public mapRegistrationToDoctorRegistrationEntity(doctorValidatedData: DoctorRegistrationData): DoctorRegistration {
        const registration = new DoctorRegistration();
        
        registration.crm = doctorValidatedData.crm;
        registration.lastUpdate = stringToLocalDate(doctorValidatedData.lastUpdate);
        registration.situation = findEnumByKeyValue(DoctorSituation, doctorValidatedData.situation);
        registration.type = findEnumByKeyValue(DoctorRegistrationType, doctorValidatedData.type);
        registration.state = findEnumByKeyValue(BrazilianState, doctorValidatedData.state);
        
        return registration;
    }

    public mapSpecialtiesDtosToEntities(specialtyDtos: DoctorSpecializationDto[]): DoctorSpecialization[] {
        return specialtyDtos.map(dto => this.mapSpecialtyDtoToEntity(dto));
    }

    public mapSpecialtyDtoToEntity(specialtyDto: DoctorSpecializationDto): DoctorSpecialization {
        const specialty = new DoctorSpecialization();
        specialty.rqe = specialtyDto.rqe;
        specialty.name = specialtyDto.name;
        return specialty;
    }

}