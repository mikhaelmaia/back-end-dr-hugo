import { Injectable } from "@nestjs/common";
import { CacheService } from "src/core/modules/cache/cache.service";
import { CfmService } from "src/core/modules/external/cfm/cfm.service";
import { DoctorRegistrationValidatedDto, DoctorRegistrationData } from "./dtos/doctor-registration-validated.dto";
import { DoctorRegistrationValidationDto } from "./dtos/doctor-registration-validation.dto";
import { CfmServiceResponse, CfmDoctorData } from "src/core/modules/external/cfm/dtos/cfm.dtos";
import { DoctorSituation } from "src/core/vo/consts/enums";

@Injectable()
export class DoctorAdapter {

    private readonly CACHE_KEY_PREFIX = 'doctor-validation-';
    private readonly VALIDATION_TTL_SECONDS = 3600;
    private readonly DOCTOR_VALID_SITUATIONS: DoctorSituation[] = [
        DoctorSituation.REGULAR
    ];

    constructor(
        private readonly cfmService: CfmService,
        private readonly cacheService: CacheService
    ) { }

    public async lookupRegistration(request: DoctorRegistrationValidationDto): Promise<DoctorRegistrationValidatedDto> {
        const cfmRequest = {
            crm: Number(request.crm),
            uf: request.state,
            chave: ''
        };
        
        const response = await this.cfmService.consultDoctor(cfmRequest);
        const doctorValidated = this.mapToDoctorRegistrationValidatedDto(response, request);
        await this.cacheService.set(`${this.CACHE_KEY_PREFIX}${request.crm}-${request.state}`, doctorValidated, this.VALIDATION_TTL_SECONDS);
        return doctorValidated;
    }

    public async getValidation(request: DoctorRegistrationValidationDto): Promise<DoctorRegistrationValidatedDto> {
        const cacheKey = `${this.CACHE_KEY_PREFIX}${request.crm}-${request.state}`;
        
        const cachedData = await this.cacheService.get<DoctorRegistrationValidatedDto>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        const validatedData = await this.lookupRegistration(request);
        
        return validatedData;
    }

    private isValidDoctor(situation: DoctorSituation): boolean {
        return this.DOCTOR_VALID_SITUATIONS.includes(situation);
    }

    private mapToDoctorRegistrationValidatedDto(
        response: CfmServiceResponse<CfmDoctorData>, 
        request: DoctorRegistrationValidationDto
    ): DoctorRegistrationValidatedDto {
        if (!response.success || !response.doctorData) {
            return this.buildErrorMessage(response);
        }

        const doctor = response.doctorData;
        const isValid = this.isValidDoctor(doctor.situacao) && this.validateSpecialties(doctor, request);

        const result = new DoctorRegistrationValidatedDto();
        result.valid = isValid;
        result.data = this.buildDoctorRegistrationData(doctor, request);
        result.message = this.buildValidationMessage(doctor, request);

        return result;
    }

    private validateSpecialties(doctor: CfmDoctorData, request: DoctorRegistrationValidationDto): boolean {
        if (request.isGeneralist) {
            return true;
        }

        if (!request.specialties || request.specialties.length === 0) {
            return false;
        }

        return request.specialties.every(specialty => 
            doctor.especialidades.some(doctorSpecialty => 
                doctorSpecialty.toLowerCase().includes(specialty.name.toLowerCase()) ||
                specialty.name.toLowerCase().includes(doctorSpecialty.toLowerCase())
            )
        );
    }

    private buildDoctorRegistrationData(doctor: CfmDoctorData, request: DoctorRegistrationValidationDto): DoctorRegistrationData {
        const data = new DoctorRegistrationData();
        
        data.name = doctor.nome;
        data.situation = doctor.situacao;
        data.type = doctor.tipoInscricao;
        data.lastUpdate = doctor.dataAtualizacao;
        data.cfmSpecialties = doctor.especialidades;
        
        data.taxId = request.taxId;
        data.crm = request.crm;
        data.state = request.state;
        data.isGeneralist = request.isGeneralist;
        data.specialties = request.specialties || [];

        return data;
    }

    private buildValidationMessage(doctor: CfmDoctorData, request: DoctorRegistrationValidationDto): string {
        if (!this.isValidDoctor(doctor.situacao)) {
            return `Registro médico com situação irregular: ${doctor.situacao}`;
        }
        if (!this.validateSpecialties(doctor, request)) {
            return 'Especialidades informadas não conferem com o registro no CRM';
        }
        return 'Registro médico validado com sucesso';
    }

    private buildErrorMessage(response: CfmServiceResponse<CfmDoctorData>): DoctorRegistrationValidatedDto {
        const result = new DoctorRegistrationValidatedDto();
        result.valid = false;
        result.data = null;
        result.message = response.error?.message || 'Erro ao consultar dados do médico no CFM';
        return result;
    }
}