import { Injectable } from '@nestjs/common';
import { PatientMedicalRecord } from './entities/medical-record.entity';
import { PatientMedicalRecordDto } from './dtos/medical-record.dto';
import { BaseMapper } from 'src/core/base/base.mapper';
import { CryptoService } from 'src/core/modules/crypto/crypto.service';

type ConditionPair = {
  has: keyof PatientMedicalRecord;
  description: keyof PatientMedicalRecord;
};

@Injectable()
export class PatientMedicalRecordMapper extends BaseMapper<
  PatientMedicalRecord,
  PatientMedicalRecordDto
> {
  public constructor(private readonly cryptoService: CryptoService) {
    super();
  }

  public toDto(entity: PatientMedicalRecord): PatientMedicalRecordDto {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,

      allergies: this.conditionToDto(entity, {
        has: 'hasAllergies',
        description: 'allergiesDescription',
      }),

      chronicDiseases: this.conditionToDto(entity, {
        has: 'hasChronicDiseases',
        description: 'chronicDiseasesDescription',
      }),

      surgeries: this.conditionToDto(entity, {
        has: 'hasSurgeries',
        description: 'surgeriesDescription',
      }),

      medicalTreatment: this.conditionToDto(entity, {
        has: 'hasMedicalTreatment',
        description: 'medicalTreatmentDescription',
      }),

      medications: this.conditionToDto(entity, {
        has: 'hasMedications',
        description: 'medicationsDescription',
      }),

      insomnia: this.conditionToDto(entity, {
        has: 'hasInsomnia',
        description: 'insomniaDescription',
      }),

      alcohol: this.conditionToDto(entity, {
        has: 'hasAlcoholUse',
        description: 'alcoholDescription',
      }),

      physicalActivity: {
        hasPhysicalActivity: entity.hasPhysicalActivity,
        physicalActivityTypes: entity.physicalActivityTypes
          ? this.cryptoService.decrypt(entity.physicalActivityTypes)
          : entity.physicalActivityTypes,
        weeklyFrequency: entity.weeklyFrequency
          ? this.cryptoService.decrypt(entity.weeklyFrequency)
          : entity.weeklyFrequency,
      },

      bloodPressure: {
        description: entity.bloodPressure
          ? this.cryptoService.decrypt(entity.bloodPressure)
          : entity.bloodPressure,
      },

      smoking: {
        isSmoker: entity.isSmoker,
        cigarettesPerDay: entity.cigarettesPerDay
          ? this.cryptoService.decrypt(entity.cigarettesPerDay)
          : entity.cigarettesPerDay,
        yearsSmoking: entity.yearsSmoking
          ? this.cryptoService.decrypt(entity.yearsSmoking)
          : entity.yearsSmoking,
      },
    };
  }

  public toEntity(dto: Partial<PatientMedicalRecordDto>): PatientMedicalRecord {
    const entity = new PatientMedicalRecord();

    this.conditionToEntity(dto.allergies, entity, {
      has: 'hasAllergies',
      description: 'allergiesDescription',
    });

    this.conditionToEntity(dto.chronicDiseases, entity, {
      has: 'hasChronicDiseases',
      description: 'chronicDiseasesDescription',
    });

    this.conditionToEntity(dto.surgeries, entity, {
      has: 'hasSurgeries',
      description: 'surgeriesDescription',
    });

    this.conditionToEntity(dto.medicalTreatment, entity, {
      has: 'hasMedicalTreatment',
      description: 'medicalTreatmentDescription',
    });

    this.conditionToEntity(dto.medications, entity, {
      has: 'hasMedications',
      description: 'medicationsDescription',
    });

    this.conditionToEntity(dto.insomnia, entity, {
      has: 'hasInsomnia',
      description: 'insomniaDescription',
    });

    this.conditionToEntity(dto.alcohol, entity, {
      has: 'hasAlcoholUse',
      description: 'alcoholDescription',
    });

    entity.hasPhysicalActivity =
      dto.physicalActivity?.hasPhysicalActivity ?? false;
    entity.physicalActivityTypes = dto.physicalActivity?.physicalActivityTypes
      ? this.cryptoService.encrypt(dto.physicalActivity.physicalActivityTypes)
      : null;
    entity.weeklyFrequency = dto.physicalActivity?.weeklyFrequency
      ? this.cryptoService.encrypt(dto.physicalActivity.weeklyFrequency)
      : null;

    entity.bloodPressure = dto.bloodPressure?.description
      ? this.cryptoService.encrypt(dto.bloodPressure.description)
      : null;

    entity.isSmoker = dto.smoking?.isSmoker ?? false;
    entity.cigarettesPerDay = dto.smoking?.cigarettesPerDay
      ? this.cryptoService.encrypt(dto.smoking.cigarettesPerDay)
      : null;
    entity.yearsSmoking = dto.smoking?.yearsSmoking
      ? this.cryptoService.encrypt(dto.smoking.yearsSmoking)
      : null;

    return entity;
  }

  private conditionToDto(entity: PatientMedicalRecord, pair: ConditionPair) {
    const raw = entity[pair.description] as string | null | undefined;
    return {
      hasCondition: entity[pair.has] as boolean,
      description: raw ? this.cryptoService.decrypt(raw) : (raw ?? null),
    };
  }

  private conditionToEntity(
    dto: { hasCondition: boolean; description?: string | null } | undefined,
    entity: PatientMedicalRecord,
    pair: ConditionPair,
  ) {
    (entity[pair.has] as boolean) = dto?.hasCondition ?? false;
    (entity[pair.description] as string | null) = dto?.description
      ? this.cryptoService.encrypt(dto.description)
      : null;
  }
}
