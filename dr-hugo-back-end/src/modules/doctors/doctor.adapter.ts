import { Inject, Injectable } from "@nestjs/common";
import { CACHE_SERVICE, CacheService } from "src/core/modules/cache/cache.service";
import { CfmService } from "src/core/modules/external/cfm/cfm.service";
import {
    DoctorRegistrationValidatedDto,
    DoctorRegistrationData
} from "./dtos/doctor-registration-validated.dto";
import { DoctorRegistrationValidationDto } from "./dtos/doctor-registration-validation.dto";
import {
    CfmServiceResponse,
    CfmDoctorData
} from "src/core/modules/external/cfm/dtos/cfm.dtos";
import {
    DoctorRegistrationType,
    DoctorSituation,
    DoctorSpecializationType
} from "src/core/vo/consts/enums";

@Injectable()
export class DoctorAdapter {

    private readonly CACHE_KEY_PREFIX = 'doctor-validation';
    private readonly VALIDATION_TTL_SECONDS = 3600;

    private readonly VALID_DOCTOR_SITUATIONS: string[] = [
        'A', // Regular
    ];

    constructor(
        private readonly cfmService: CfmService,
        @Inject(CACHE_SERVICE)
        private readonly cacheService: CacheService
    ) {}

    public async lookupRegistration(
        request: DoctorRegistrationValidationDto
    ): Promise<DoctorRegistrationValidatedDto> {

        const cacheKey = this.buildCacheKey(request.taxId);

        const response = await this.cfmService.consultDoctor({
            crm: Number(request.crm),
            uf: request.state,
            chave: ''
        });

        const validated = this.mapToValidatedDto(response, request);

        await this.cacheService.set(
            cacheKey,
            validated,
            this.VALIDATION_TTL_SECONDS
        );

        return validated;
    }

    public async getLookedRegistration(
        taxId: string
    ): Promise<DoctorRegistrationValidatedDto | null> {
        return this.cacheService.get(
            this.buildCacheKey(taxId)
        );
    }

    private mapToValidatedDto(
        response: CfmServiceResponse<CfmDoctorData>,
        request: DoctorRegistrationValidationDto
    ): DoctorRegistrationValidatedDto {

        if (!response.success || !response.doctorData) {
            return this.buildErrorResult(response);
        }

        const doctor = response.doctorData;

        const situationValid = this.isSituationValid(doctor.situacao);
        const generalistValid = this.isGeneralistValid(request);
        const generalistConsistent = this.isGeneralistConsistent(request);
        const specialtiesValid = this.validateSpecialties(doctor, request);

        const isValid =
            situationValid &&
            generalistConsistent &&
            (generalistValid || specialtiesValid);

        return {
            valid: isValid,
            data: this.buildDoctorRegistrationData(doctor, request),
            message: this.buildValidationMessage({
                situationValid,
                generalistConsistent,
                generalistValid,
                specialtiesValid
            })
        };
    }

    private isSituationValid(situation: string): boolean {
        return this.VALID_DOCTOR_SITUATIONS.includes(situation);
    }

    private isGeneralistValid(request: DoctorRegistrationValidationDto): boolean {
        return request.isGeneralist === true;
    }

    private isGeneralistConsistent(
        request: DoctorRegistrationValidationDto
    ): boolean {
        if (!request.isGeneralist) {
            return true;
        }

        return !request.specialties || request.specialties.length === 0;
    }

    private validateSpecialties(
        doctor: CfmDoctorData,
        request: DoctorRegistrationValidationDto
    ): boolean {

        if (request.isGeneralist) {
            return true;
        }

        if (!request.specialties || request.specialties.length === 0) {
            return false;
        }

        if (!doctor.especialidades || doctor.especialidades.length === 0) {
            return false;
        }

        return request.specialties.every(specialty => {
            const expected = DoctorSpecializationType[specialty.name];

            return doctor.especialidades.some(actual =>
                actual === expected || actual.includes(expected) || expected.includes(actual)
            );
        });
    }

    private buildDoctorRegistrationData(
        doctor: CfmDoctorData,
        request: DoctorRegistrationValidationDto
    ): DoctorRegistrationData {
        return {
            name: doctor.nome,
            situation: this.mapExternalSituationToInternal(doctor.situacao),
            type: this.mapExternalTypeToInternal(doctor.tipoInscricao),
            lastUpdate: doctor.dataAtualizacao,
            cfmSpecialties: doctor.especialidades,

            taxId: request.taxId,
            crm: request.crm,
            state: request.state,
            isGeneralist: request.isGeneralist,
            specialties: request.specialties || []
        };
    }

    private buildValidationMessage(flags: {
        situationValid: boolean;
        generalistConsistent: boolean;
        generalistValid: boolean;
        specialtiesValid: boolean;
    }): string {

        if (!flags.situationValid) {
            return 'Registro médico com situação irregular no CFM';
        }

        if (!flags.generalistConsistent) {
            return 'Médico generalista não pode informar especialidades';
        }

        if (!flags.generalistValid && !flags.specialtiesValid) {
            return 'Especialidades informadas não conferem com o registro no CFM';
        }

        return 'Registro médico validado com sucesso';
    }

    private mapExternalSituationToInternal(
        situation: string
    ): DoctorSituation | null {
        switch (situation.toUpperCase()) {
            case 'A':
                return DoctorSituation.REGULAR;
            case 'B':
                return DoctorSituation.SUSPENSAO_PARCIAL_PERMANENTE;
            case 'C':
                return DoctorSituation.CASSADO;
            case 'E':
                return DoctorSituation.INOPERANTE;
            case 'F':
                return DoctorSituation.FALECIDO;
            case 'G':
                return DoctorSituation.SEM_EXERCICIO_UF;
            case 'I':
                return DoctorSituation.INTERDICAO_CAUTELAR_TOTAL;
            case 'J':
                return DoctorSituation.SUSPENSO_ORDEM_JUDICIAL_PARCIAL;
            case 'L':
                return DoctorSituation.CANCELADO;
            case 'M':
                return DoctorSituation.SUSPENSAO_TOTAL_TEMPORARIA;
            case 'N':
                return DoctorSituation.INTERDICAO_CAUTELAR_PARCIAL;
            case 'O':
                return DoctorSituation.SUSPENSO_ORDEM_JUDICIAL_TOTAL;
            case 'P':
                return DoctorSituation.APOSENTADO;
            case 'R':
                return DoctorSituation.SUSPENSAO_TEMPORARIA;
            case 'S':
                return DoctorSituation.SUSPENSO_TOTAL;
            case 'T':
                return DoctorSituation.TRANSFERIDO;
            case 'X':
                return DoctorSituation.SUSPENSO_PARCIAL;
            default:
                return null;
        }
    }

    private mapExternalTypeToInternal(
        type: string
    ): DoctorRegistrationType | null {
        switch (type.toUpperCase()) {
            case 'P':
                return DoctorRegistrationType.PRINCIPAL;
            case 'S':
                return DoctorRegistrationType.SECUNDARIA;
            case 'V':
                return DoctorRegistrationType.PROVISORIA;
            case 'T':
                return DoctorRegistrationType.TEMPORARIA;
            case 'E':
                return DoctorRegistrationType.ESTUDANTE_ESTRANGEIRO;
            default:
                return null;
        }
    }

    private buildErrorResult(
        response: CfmServiceResponse<CfmDoctorData>
    ): DoctorRegistrationValidatedDto {

        return {
            valid: false,
            data: null,
            message:
                response.error?.message ||
                'Erro ao consultar dados do médico no CFM'
        };
    }

    private buildCacheKey(
        taxId: string
    ): string {
        return `${this.CACHE_KEY_PREFIX}:${taxId}`;
    }
}