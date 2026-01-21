import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditDto } from './dtos/audit.dto';
import { AuditEventType, UserRole } from '../../vo/consts/enums';
import { Roles } from '../../vo/decorators/roles.decorator';
import { IsUUIDParam } from '../../vo/decorators/is-uuid-param.decorator';
import { BaseController } from '../../base/base.controller';
import { Audit } from './entities/audit.entity';

@Controller('audit')
export class AuditController extends BaseController<
  Audit,
  AuditDto,
  AuditService
> {
  public constructor(service: AuditService) {
    super(service);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  public async findAllWithFilters(
    @Query('eventType') eventType?: AuditEventType,
    @Query('entityName') entityName?: string,
    @Query('entityId') entityId?: string,
    @Query('authorId') authorId?: string,
  ): Promise<AuditDto[]> {
    return await this.service.findAllWithFilters(
      eventType,
      entityName,
      entityId,
      authorId,
    );
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  public async findByIdWithRelations(
    @IsUUIDParam('id') id: string,
  ): Promise<AuditDto> {
    return await this.service.findByIdWithRelations(id);
  }
}
