import {
  Body,
  Controller,
  Post,
  Put,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiProduces,
} from '@nestjs/swagger';
import { PatientDocumentService } from './patient-document.service';
import { CreatePatientDocumentDto } from './dtos/create-patient-document.dto';
import { RenamePatientDocumentDto } from './dtos/rename-patient-document.dto';
import { PatientDocumentDto } from './dtos/patient-document.dto';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { Auditable } from 'src/core/vo/decorators/auditable.decorator';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { PatientDocumentPaths } from 'src/core/vo/consts/paths';
import {
  AuditEventType,
  PatientDocumentType,
  UserRole,
} from 'src/core/vo/consts/enums';
import type { PaginationParams } from 'src/core/vo/types/types';
import { PatientDocument } from './entities/patient-document.entity';
import { NoCache } from 'src/core/vo/decorators/no-cache.decorator';
import { PatientDocumentAvailableFiltersDto } from './dtos/patient-document-available-filters.dto';
import { PatientDocumentPaginatedDto } from './dtos/patient-document-paginated.dto';
import { QueryParamsTransformPipe } from './pipes/query-params-transform.pipe';
import { Roles } from 'src/core/vo/decorators/roles.decorator';

@ApiTags('Patient Documents')
@ApiBearerAuth()
@Roles(UserRole.PATIENT)
@Controller(PatientDocumentPaths.ROOT)
export class PatientDocumentController {
  constructor(private readonly service: PatientDocumentService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar novo documento de paciente',
    description:
      'Cria um novo documento de paciente. Para exames laboratoriais (LABORATORY_EXAM), ' +
      'o sistema automaticamente busca e associa dados TUSS com base na descrição.',
  })
  @ApiBody({ type: CreatePatientDocumentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Documento criado com sucesso, incluindo auto-população TUSS para exames laboratoriais',
    type: PatientDocumentDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Documento com esta descrição já existe',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.CREATE,
    entityName: 'PatientDocument',
    mode: 'success',
    entityIdExtractor: ({ result }) => result?.id ?? null,
    dataExtractor: ({ body, result }) => ({
      request: {
        type: body.type,
        description: body.description,
        examDate: body.examDate,
        mediaIdsCount: body.mediaIds?.length ?? 0,
        requesterName: body.requesterName,
        examLocation: body.examLocation,
      },
      result: {
        id: result?.id,
        createdAt: result?.createdAt,
      },
    }),
  })
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() dto: CreatePatientDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<PatientDocumentDto> {
    return this.service.create(userId, dto);
  }

  @Get(PatientDocumentPaths.MONTHLY)
  @NoCache()
  @ApiOperation({
    summary: 'Listar documentos mensais paginados',
    description:
      'Lista documentos de pacientes do usuário atual com paginação mensal. ' +
      'Dados incluem informações básicas de paciente, tipo de documento e metadados. ' +
      'Sistema completo de filtragem, ordenação e paginação disponível.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página (padrão: 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de itens por página (padrão: 10, máx: 100)',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description:
      'Campo para ordenação. Campos disponíveis: id, createdAt, updatedAt, examMonth, examDate, type, description, requesterName, examLocation',
    type: String,
    example: 'examDate',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Direção da ordenação',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @ApiQuery({
    name: 'filter[type]',
    required: false,
    description: 'Filtrar por tipo de documento (valor exato)',
    enum: PatientDocumentType,
    example: 'LABORATORY_EXAM',
  })
  @ApiQuery({
    name: 'filter[examMonth]',
    required: false,
    description: 'Filtrar por mês do exame no formato YYYY-MM',
    type: String,
    example: '2024-01',
  })
  @ApiQuery({
    name: 'filter[description][like]',
    required: false,
    description: 'Buscar na descrição (case-sensitive, use % para wildcards)',
    type: String,
    example: '%hemograma%',
  })
  @ApiQuery({
    name: 'filter[description][ilike]',
    required: false,
    description: 'Buscar na descrição (case-insensitive, use % para wildcards)',
    type: String,
    example: '%HEMOGRAMA%',
  })
  @ApiQuery({
    name: 'filter[requesterName][ilike]',
    required: false,
    description:
      'Buscar médico solicitante (case-insensitive, use % para wildcards)',
    type: String,
    example: '%silva%',
  })
  @ApiQuery({
    name: 'filter[examLocation][ilike]',
    required: false,
    description:
      'Buscar local do exame (case-insensitive, use % para wildcards)',
    type: String,
    example: '%hospital%',
  })
  @ApiQuery({
    name: 'filter[examDate][gte]',
    required: false,
    description: 'Data do exame maior ou igual (formato: YYYY-MM-DD)',
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'filter[examDate][lte]',
    required: false,
    description: 'Data do exame menor ou igual (formato: YYYY-MM-DD)',
    type: String,
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'filter[type][in]',
    required: false,
    description: 'Filtrar por múltiplos tipos (separar com vírgula)',
    type: String,
    example: 'LABORATORY_EXAM,PRESCRIPTION',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Lista paginada de documentos mensais agrupados por mês. Use o endpoint /available-filters para obter valores de filtro válidos.',
    type: PatientDocumentPaginatedDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetros de entrada inválidos',
    type: ExceptionResponse,
  })
  public async findMonthly(
    @CurrentUser('id') userId: string,
    @Query(QueryParamsTransformPipe)
    pagination: PaginationParams<PatientDocument>,
  ): Promise<PatientDocumentPaginatedDto> {
    return this.service.findMonthly(userId, pagination);
  }

  @Get(PatientDocumentPaths.STREAM)
  @NoCache()
  @ApiOperation({
    summary: 'Stream de arquivo de documento',
    description:
      'Retorna stream otimizado de arquivo de documento para visualização em navegador. ' +
      'Suporta Range requests para reprodução eficiente de vídeos e PDFs.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID do arquivo de mídia associado ao documento',
    type: String,
    format: 'uuid',
  })
  @ApiProduces(
    'application/octet-stream',
    'video/*',
    'image/*',
    'application/pdf',
  )
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stream do arquivo de documento',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Documento ou arquivo não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado ao documento',
    type: ExceptionResponse,
  })
  public async getStream(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @CurrentUser('id') userId: string,
  ): Promise<StreamableFile> {
    const streamData = await this.service.getStream(
      userId,
      documentId,
      mediaId,
    );

    if (!streamData) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    return new StreamableFile(streamData.stream, {
      disposition: `inline; filename="${streamData.filename}"`,
      type: streamData.contentType,
    });
  }

  @Get(PatientDocumentPaths.DOWNLOAD)
  @NoCache()
  @ApiOperation({
    summary: 'Download de arquivo de documento',
    description:
      'Força download de arquivo de documento com nome original preservado. ' +
      'Adequado para salvar documentos localmente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento',
    type: String,
    format: 'uuid',
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID do arquivo de mídia associado ao documento',
    type: String,
    format: 'uuid',
  })
  @ApiProduces('application/octet-stream')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Arquivo baixado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Documento ou arquivo não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado ao documento',
    type: ExceptionResponse,
  })
  public async downloadDocument(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<StreamableFile> {
    const downloadData = await this.service.downloadDocument(
      userId,
      documentId,
    );

    if (!downloadData) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    return new StreamableFile(downloadData.stream, {
      disposition: `attachment; filename="${downloadData.filename}"`,
      type: downloadData.contentType,
    });
  }

  @Get(PatientDocumentPaths.FILTERS)
  @NoCache()
  @ApiOperation({
    summary: 'Obter filtros disponíveis para documentos',
    description:
      'Retorna todos os valores únicos disponíveis para filtrar documentos: ' +
      'tipos de documento, descrições, médicos solicitantes, locais e datas de exames.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Filtros disponíveis carregados com sucesso',
    type: PatientDocumentAvailableFiltersDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Parâmetros de entrada inválidos',
    type: ExceptionResponse,
  })
  public async getAvailableFilters(
    @CurrentUser('id') userId: string,
  ): Promise<PatientDocumentAvailableFiltersDto> {
    return this.service.findAvailableFilters(userId);
  }

  @Get(PatientDocumentPaths.BY_ID)
  @NoCache()
  @ApiOperation({
    summary: 'Buscar documento por ID',
    description:
      'Retorna os detalhes completos de um documento específico, incluindo ' +
      'informações do documento e metadados das mídias associadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documento encontrado com sucesso',
    type: PatientDocumentDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Documento não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado ao documento',
    type: ExceptionResponse,
  })
  public async findById(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<PatientDocumentDto> {
    return this.service.findById(userId, documentId);
  }

  @Put()
  @ApiOperation({
    summary: 'Atualizar documento de paciente',
    description:
      'Atualiza todos os dados de um documento de paciente existente. ' +
      'Permite alterar tipo, descrição, data do exame, médico solicitante, local e observações. ' +
      'Os arquivos de mídia são substituídos pelos novos IDs informados. ' +
      'Arquivos removidos são excluídos permanentemente.',
  })
  @ApiBody({ type: PatientDocumentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documento atualizado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Documento não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado ao documento ou mídia',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.UPDATE,
    entityName: 'PatientDocument',
    mode: 'success',
    entityIdExtractor: ({ body }) => body?.id ?? null,
    dataExtractor: ({ body }) => ({
      request: {
        id: body.id,
        type: body.type,
        description: body.description,
        examDate: body.examDate,
        mediaIdsCount: body.mediaIds?.length ?? 0,
        requesterName: body.requesterName,
        examLocation: body.examLocation,
      },
    }),
  })
  @HttpCode(HttpStatus.OK)
  public async update(
    @Body() dto: PatientDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.service.update(userId, dto);
  }

  @Patch(PatientDocumentPaths.RENAME)
  @ApiOperation({
    summary: 'Renomear documento de paciente',
    description:
      'Atualiza a descrição de um documento existente. ' +
      'A nova descrição deve ser única no sistema.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento a ser renomeado',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: RenamePatientDocumentDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documento renomeado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Documento não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe um documento com esta descrição',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado ao documento',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.UPDATE,
    entityName: 'PatientDocument',
    mode: 'success',
    entityIdExtractor: ({ params }) => params?.id ?? null,
    dataExtractor: ({ params, body }) => ({
      request: {
        id: params?.id,
        description: body.description,
      },
    }),
  })
  @HttpCode(HttpStatus.OK)
  public async rename(
    @Param('id', ParseUUIDPipe) documentId: string,
    @Body() dto: RenamePatientDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.service.rename(userId, documentId, dto.description);
  }

  @Delete(PatientDocumentPaths.BY_ID)
  @ApiOperation({
    summary: 'Excluir documento de paciente (soft delete)',
    description:
      'Exclui logicamente um documento de paciente e todos os seus arquivos associados. ' +
      'Os dados ficam marcados como excluídos mas permanecem no banco para auditoria.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do documento a ser excluído',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documento excluído com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Documento não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado ao documento',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.DELETE,
    entityName: 'PatientDocument',
    mode: 'success',
    entityIdExtractor: ({ params }) => params?.id ?? null,
    dataExtractor: ({ params }) => ({
      request: {
        id: params?.id,
      },
    }),
  })
  @HttpCode(HttpStatus.OK)
  public async softDelete(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.service.softDelete(userId, documentId);
  }
}
