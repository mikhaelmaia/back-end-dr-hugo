import { PatientMedicalRecord } from './entities/medical-record.entity';
import { PatientMedicalRecordDto } from './dtos/medical-record.dto';
import { BaseMapper } from 'src/core/base/base.mapper';

type ConditionPair = {
  has: keyof PatientMedicalRecord;
  description: keyof PatientMedicalRecord;
};

export class PatientMedicalRecordMapper extends BaseMapper<
  PatientMedicalRecord,
  PatientMedicalRecordDto
> {
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

      physicalActivity: this.conditionToDto(entity, {
        has: 'hasPhysicalActivity',
        description: 'physicalActivityDescription',
      }),

      bloodPressure: { description: entity.bloodPressure },

      smoking: {
        isSmoker: entity.isSmoker,
        cigarettesPerDay: entity.cigarettesPerDay,
        yearsSmoking: entity.yearsSmoking,
      },

      acceptedTerms: entity.acceptedTerms,
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

    this.conditionToEntity(dto.physicalActivity, entity, {
      has: 'hasPhysicalActivity',
      description: 'physicalActivityDescription',
    });

    entity.bloodPressure = dto.bloodPressure?.description ?? null;

    entity.isSmoker = dto.smoking?.isSmoker ?? false;
    entity.cigarettesPerDay = dto.smoking?.cigarettesPerDay ?? null;
    entity.yearsSmoking = dto.smoking?.yearsSmoking ?? null;

    entity.acceptedTerms = dto.acceptedTerms ?? [];

    return entity;
  }

  private conditionToDto(entity: PatientMedicalRecord, pair: ConditionPair) {
    return {
      hasCondition: entity[pair.has] as boolean,
      description: entity[pair.description] as string | null,
    };
  }

  private conditionToEntity(
    dto: { hasCondition: boolean; description?: string | null } | undefined,
    entity: PatientMedicalRecord,
    pair: ConditionPair,
  ) {
    (entity[pair.has] as boolean) = dto?.hasCondition ?? false;
    (entity[pair.description] as string | null) = dto?.description ?? null;
  }
}
