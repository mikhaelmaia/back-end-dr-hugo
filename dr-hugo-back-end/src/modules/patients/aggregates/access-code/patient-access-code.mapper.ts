import { Injectable } from '@nestjs/common';
import { PatientAccessCode } from './entities/patient-access-code.entity';
import { PatientAccessCodeDto } from './dtos/patient-access-code.dto';

@Injectable()
export class PatientAccessCodeMapper {
  public toDto(entity: PatientAccessCode): PatientAccessCodeDto {
    const now = Date.now();

    const totalTime = entity.getTotalTimeMs();
    const elapsed = entity.getElapsedTimeMs();
    const remaining = Math.max(entity.expiresAt.getTime() - now, 0);

    const response = new PatientAccessCodeDto();
    response.code = entity.code;
    response.expiresAt = entity.expiresAt;
    response.totalTimeMs = totalTime;
    response.elapsedTimeMs = elapsed;
    response.remainingTimeMs = remaining;

    return response;
  }
}
