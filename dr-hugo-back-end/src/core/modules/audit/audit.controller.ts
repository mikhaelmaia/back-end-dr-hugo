import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditDto } from './dtos/audit.dto';
import { AuditEventType, UserRole } from '../../vo/consts/enums';
import { Roles } from '../../vo/decorators/roles.decorator';
import { IsUUIDParam } from '../../vo/decorators/is-uuid-param.decorator';
import { BaseController } from '../../base/base.controller';
import { Audit } from './entities/audit.entity';
import { AuditPaths } from '../../vo/consts/paths';
import { ExceptionResponse } from '../../config/exceptions/exception-response';

@ApiTags('Auditoria do Sistema')
@ApiBearerAuth()
@Controller(AuditPaths.BASE)
export class AuditController extends BaseController<
  Audit,
  AuditDto,
  AuditService
> {
  public constructor(service: AuditService) {
    super(service);
  }

  @ApiOperation({
    summary: 'Listar registros de auditoria com filtros',
    description: 'Retorna uma lista de registros de auditoria aplicando filtros opcionais. Apenas administradores têm acesso a este endpoint.'
  })
  @ApiQuery({
    name: 'eventType',
    description: 'Filtrar por tipo de evento de auditoria',
    enum: AuditEventType,
    required: false,
    example: 'CREATE'
  })
  @ApiQuery({
    name: 'entityName',
    description: 'Filtrar por nome da entidade auditada',
    required: false,
    example: 'User'
  })
  @ApiQuery({
    name: 'entityId',
    description: 'Filtrar por ID da entidade auditada (UUID)',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiQuery({
    name: 'authorId',
    description: 'Filtrar por ID do usuário que executou a ação (UUID)',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros de auditoria retornada com sucesso',
    type: [AuditDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Parâmetros de consulta inválidos',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou ausente',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
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

  @ApiOperation({
    summary: 'Buscar registro de auditoria por ID',
    description: 'Retorna um registro específico de auditoria com todas as relações (autor e fingerprint). Apenas administradores têm acesso a este endpoint.'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único do registro de auditoria (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de auditoria encontrado com sucesso',
    type: AuditDto
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (formato UUID inválido)',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou ausente',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas administradores',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 404,
    description: 'Registro de auditoria não encontrado',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Roles(UserRole.ADMIN)
  @Get(AuditPaths.FIND_BY_ID)
  @HttpCode(HttpStatus.OK)
  public async findByIdWithRelations(
    @IsUUIDParam('id') id: string,
  ): Promise<AuditDto> {
    return await this.service.findByIdWithRelations(id);
  }
}
