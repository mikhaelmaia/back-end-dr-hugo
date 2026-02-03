import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { AuditDto } from './dtos/audit.dto';
import { CreateAuditDto } from './dtos/create-audit.dto';
import { Audit } from './entities/audit.entity';
import { AuditMapper } from './audit.mapper';
import { BaseService } from '../../base/base.service';
import { AuditEventType } from '../../vo/consts/enums';
import { FingerprintService } from './fingerprint/fingerprint.service';
import { Optional } from 'src/core/utils/optional';
import { AuditDataPayload } from './types/audit.types';

@Injectable()
export class AuditService extends BaseService<
  Audit,
  AuditDto,
  AuditRepository,
  AuditMapper
> {
  private readonly AUDIT_EVENT_NOT_FOUND: string =
    'Evento de auditoria não encontrado';

  constructor(
    repository: AuditRepository,
    mapper: AuditMapper,
    private readonly fingerprintService: FingerprintService,
  ) {
    super(repository, mapper);
  }

  public async process(
    auditDto: CreateAuditDto,
    fingerprintData: AuditDataPayload,
  ): Promise<AuditDto> {
    const audit = new Audit();
    audit.eventType = auditDto.eventType;
    audit.entityName = auditDto.entityName;
    audit.entityId = auditDto.entityId;
    audit.data = auditDto.data;
    audit.author = {
      id: fingerprintData.author?.id || null,
    } as any;

    if (fingerprintData) {
      const fingerprint = this.fingerprintService.process({
        fingerprint: fingerprintData.fingerprint,
        ip: fingerprintData.ip,
        userAgent: fingerprintData.userAgent,
        sessionId: fingerprintData.sessionId || null,
      });
      audit.fingerprint = fingerprint;
    }

    const savedAudit = await this.repository.save(audit);
    return this.mapper.toDto(savedAudit);
  }

  public async findAllWithFilters(
    eventType?: AuditEventType,
    entityName?: string,
    entityId?: string,
    authorId?: string,
  ): Promise<AuditDto[]> {
    const audits = await this.repository.findAllWithFilters(
      eventType,
      entityName,
      entityId,
      authorId,
    );
    return this.mapper.toDtos(audits);
  }

  public async findByIdWithRelations(id: string): Promise<AuditDto> {
    return Optional.ofNullable(await this.repository.findByIdWithRelations(id))
      .map((audit) => this.mapper.toDto(audit))
      .orElseThrow(() => new NotFoundException(this.AUDIT_EVENT_NOT_FOUND));
  }
}
