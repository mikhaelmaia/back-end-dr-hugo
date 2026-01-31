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
import { stringToLocalDate } from "src/core/utils/date-time.utils";
import { User } from "../users/entities/user.entity";
import { findEnumKeyByValue } from "src/core/utils/enum.utils";

@Injectable()
export class DoctorMapper extends BaseMapper<Doctor, DoctorDto> {
    
    public toDto(entity: Doctor): DoctorDto {
        const dto = new DoctorDto();
        
        dto.id = entity.id;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        
        dto.birthDate = entity.birthDate;
        dto.isGeneralist = entity.isGeneralist;
        
        if (entity.user) {
            dto.name = entity.user.name;
            dto.email = entity.user.email;
            dto.taxId = entity.user.taxId;
            dto.phone = entity.user.phone;
            dto.countryCode = entity.user.countryCode;
            dto.countryIdd = entity.user.countryIdd;
            dto.role = entity.user.role;
            dto.acceptedTerms = entity.user.acceptedTerms;
        }
        
        if (entity.registration) {
            const registrationDto = new (require('./aggregates/registration/dtos/doctor-registration.dto').DoctorRegistrationDto)();
            registrationDto.id = entity.registration.id;
            registrationDto.crm = entity.registration.crm;
            registrationDto.situation = entity.registration.situation;
            registrationDto.type = entity.registration.type;
            registrationDto.lastUpdate = entity.registration.lastUpdate;
            registrationDto.state = entity.registration.state;
            dto.registration = registrationDto;
            dto.state = entity.registration.state;
        }
        
        if (entity.specializations) {
            dto.specializations = entity.specializations.map(spec => {
                const specDto = new DoctorSpecializationDto();
                specDto.id = spec.id;
                specDto.name = spec.name;
                specDto.rqe = spec.rqe;
                return specDto;
            });
        }
        
        return dto;
    }

    public toEntity(dto: Partial<DoctorDto>): Doctor {
        const entity = new Doctor();
        
        entity.id = dto.id;
        entity.createdAt = dto.createdAt;
        entity.updatedAt = dto.updatedAt;
        
        entity.birthDate = dto.birthDate;
        entity.isGeneralist = dto.isGeneralist;
        
        entity.user = new User();
        
        entity.user.name = dto.name;
        entity.user.email = dto.email;
        entity.user.taxId = dto.taxId;
        entity.user.phone = dto.phone;
        entity.user.countryCode = dto.countryCode;
        entity.user.countryIdd = dto.countryIdd;
        entity.user.role = dto.role;
        entity.user.acceptedTerms = dto.acceptedTerms;
        
        return entity;
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
        user.acceptedTerms = dto.acceptedTerms;

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
        registration.situation = findEnumKeyByValue(DoctorSituation, doctorValidatedData.situation) as DoctorSituation;
        registration.type = findEnumKeyByValue(DoctorRegistrationType, doctorValidatedData.type) as DoctorRegistrationType;
        registration.state = findEnumKeyByValue(BrazilianState, doctorValidatedData.state) as BrazilianState;
        
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