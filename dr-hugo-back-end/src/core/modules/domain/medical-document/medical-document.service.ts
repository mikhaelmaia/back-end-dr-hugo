import { Injectable } from '@nestjs/common';
import {
  MedicalRecordDescription,
  MedicalReportDescription,
  PatientDocumentType,
  PrescriptionDescription,
  VaccinationDescription,
} from 'src/core/vo/consts/enums';
import { MedicalDocumentDescriptionDto } from './dtos/medical-document-description.dto';
import { TuusCategoryService } from '../tuus-category/tuus-category.service';
import { findEnumValueByKeyOrValue } from 'src/core/utils/enum.utils';

@Injectable()
export class MedicalDocumentService {
  constructor(private readonly tuusCategoryService: TuusCategoryService) {}

  public async getDescriptionOptionsByType(
    type: PatientDocumentType,
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<MedicalDocumentDescriptionDto> {
    const enumType = findEnumValueByKeyOrValue(PatientDocumentType, type);
    switch (enumType) {
      case PatientDocumentType.LABORATORY_EXAM:
        return this.getLaboratoryExamDescriptions(page, limit, search);

      case PatientDocumentType.PRESCRIPTION:
        return this.getPaginatedStaticDescriptions(
          Object.values(PrescriptionDescription),
          true,
          page,
          limit,
          search,
        );

      case PatientDocumentType.MEDICAL_REPORT:
        return this.getPaginatedStaticDescriptions(
          Object.values(MedicalReportDescription),
          false,
          page,
          limit,
          search,
        );

      case PatientDocumentType.MEDICAL_RECORD:
        return this.getPaginatedStaticDescriptions(
          Object.values(MedicalRecordDescription),
          false,
          page,
          limit,
          search,
        );

      case PatientDocumentType.VACCINATION_CARD:
        return this.getPaginatedStaticDescriptions(
          Object.values(VaccinationDescription),
          false,
          page,
          limit,
          search,
        );

      case PatientDocumentType.OTHER:
        return {
          options: [],
          allowCustomDescription: true,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        };

      default:
        return {
          options: [],
          allowCustomDescription: false,
          totalItems: 0,
          currentPage: page,
          totalPages: 0,
        };
    }
  }

  private async getLaboratoryExamDescriptions(
    page: number,
    limit: number,
    search?: string,
  ): Promise<MedicalDocumentDescriptionDto> {
    const { descriptions, totalItems } =
      await this.tuusCategoryService.findDescriptionsPaged(page, limit, search);

    return {
      options: descriptions,
      allowCustomDescription: false,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  private getPaginatedStaticDescriptions(
    allDescriptions: string[],
    allowCustomDescription: boolean,
    page: number,
    limit: number,
    search?: string,
  ): MedicalDocumentDescriptionDto {
    const filtered = search
      ? allDescriptions.filter((d) =>
          d.toLowerCase().includes(search.toLowerCase()),
        )
      : allDescriptions;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDescriptions = filtered.slice(startIndex, endIndex);

    return {
      options: paginatedDescriptions,
      allowCustomDescription,
      totalItems: filtered.length,
      currentPage: page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }
}
