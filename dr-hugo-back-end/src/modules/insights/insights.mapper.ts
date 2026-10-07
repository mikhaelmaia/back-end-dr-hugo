import { Injectable } from '@nestjs/common';
import { InsightsTotalsDto } from './dtos/insights-totals.dto';

@Injectable()
export class InsightsMapper {
  public toPatientTotals(
    totalDocuments: number,
    totalDoctorsGranted: number,
    totalInstitutionsGranted: number,
  ): InsightsTotalsDto {
    const dto = new InsightsTotalsDto();
    dto.totalDocuments = totalDocuments;
    dto.totalDoctorsGranted = totalDoctorsGranted;
    dto.totalInstitutionsGranted = totalInstitutionsGranted;
    return dto;
  }

  public toGranteeTotals(
    totalPatientsGranted: number,
    totalPatientsGrantedThisMonth: number,
  ): InsightsTotalsDto {
    const dto = new InsightsTotalsDto();
    dto.totalPatientsGranted = totalPatientsGranted;
    dto.totalPatientsGrantedThisMonth = totalPatientsGrantedThisMonth;
    return dto;
  }
}
