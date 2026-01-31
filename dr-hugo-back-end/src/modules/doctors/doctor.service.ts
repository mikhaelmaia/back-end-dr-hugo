import { BadRequestException, Injectable } from "@nestjs/common";
import { BaseService } from "src/core/base/base.service";
import { DoctorRepository } from "./doctor.repository";
import { DoctorMapper } from "./doctor.mapper";
import { DoctorAdapter } from "./doctor.adapter";
import { DoctorDto } from "./dtos/doctor.dto";
import { Doctor } from "./entities/doctor.entity";
import { DoctorRegistrationValidatedDto } from "./dtos/doctor-registration-validated.dto";
import { DoctorRegistrationValidationDto } from "./dtos/doctor-registration-validation.dto";
import { CreateDoctorDto } from "./dtos/create-doctor.dto";
import { UserService } from "../users/user.service";
import {  whenNullThrows } from "src/core/utils/functions";

@Injectable()
export class DoctorService extends BaseService<Doctor, DoctorDto, DoctorRepository, DoctorMapper> {

    private readonly LOOKUP_REGISTRATION_IS_MANDATORY_MESSAGE = 'Validação do registro do médico é obrigatória. Por favor, realize a consulta antes de criar o cadastro do médico.';

    public constructor(
        doctorRepository: DoctorRepository,
        doctorMapper: DoctorMapper,
        private readonly doctorAdapter: DoctorAdapter,
        private readonly userService: UserService
    ) {
        super(doctorRepository, doctorMapper);
    }

    public async lookupRegistration(doctorRegistrationValidation: DoctorRegistrationValidationDto): Promise<DoctorRegistrationValidatedDto> {
        return this.doctorAdapter.lookupRegistration(doctorRegistrationValidation);
    }

    public async createDoctor(doctorDto: CreateDoctorDto): Promise<DoctorDto> {
        const lookedUpRegistration = await this.doctorAdapter.getLookedRegistration(doctorDto.taxId);

        whenNullThrows(
            lookedUpRegistration,
            () => new BadRequestException(this.LOOKUP_REGISTRATION_IS_MANDATORY_MESSAGE)
        );

        const doctor = this.mapper.mapValidatedToDoctor(lookedUpRegistration);

        const [ doctorToCreate, user ] = this.mapper.mapCreationDtoToEntityAndUser(doctorDto);

        user.name = lookedUpRegistration.data.name;
        doctor.birthDate = doctorToCreate.birthDate;

        doctor.clearId();

        const savedUser = await this.userService.create(user);

        doctor.user = {
            id: savedUser.id,
            isValid: lookedUpRegistration.valid
        } as any;
        
        const savedDoctor = await this.repository.save(doctor);

        return this.mapper.toDto(savedDoctor);
    }

}