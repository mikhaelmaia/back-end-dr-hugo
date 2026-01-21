import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../../base/base.mapper';
import { Audit } from './entities/audit.entity';
import { AuditDto } from './dtos/audit.dto';

@Injectable()
export class AuditMapper extends BaseMapper<Audit, AuditDto> {
  toDto(entity: Audit): AuditDto {
    const dto = new AuditDto();
    dto.id = entity.id;
    dto.eventType = entity.eventType;
    dto.entityName = entity.entityName;
    dto.entityId = entity.entityId;
    dto.data = entity.data;
    dto.author = entity.author
      ? ({
          id: entity.author.id,
        } as any)
      : null;
    dto.fingerprint = entity.fingerprint
      ? ({
          id: entity.fingerprint.id,
          fingerprintHash: entity.fingerprint.fingerprint,
          ip: entity.fingerprint.ip,
          userAgent: entity.fingerprint.userAgent,
          sessionId: entity.fingerprint.sessionId,
          version: entity.fingerprint.version,
          createdAt: entity.fingerprint.createdAt?.toISOString(),
          updatedAt: entity.fingerprint.updatedAt?.toISOString(),
        } as any)
      : null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  toEntity(dto: Partial<AuditDto>): Audit {
    const entity = new Audit();
    entity.id = dto.id;
    entity.eventType = dto.eventType;
    entity.entityName = dto.entityName;
    entity.entityId = dto.entityId;
    entity.data = dto.data;
    return entity;
  }
}
