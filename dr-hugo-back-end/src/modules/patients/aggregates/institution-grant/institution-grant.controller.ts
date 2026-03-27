import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { AuditEventType, MedicalInstitutionType, UserRole } from 'src/core/vo/consts/enums';
import { InstitutionGrantPaths } from 'src/core/vo/consts/paths';
import { Auditable } from 'src/core/vo/decorators/auditable.decorator';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { IsUUIDParam } from 'src/core/vo/decorators/is-uuid-param.decorator';
import { NoCache } from 'src/core/vo/decorators/no-cache.decorator';
import { Roles } from 'src/core/vo/decorators/roles.decorator';
import { CreatePatientDocumentDto } from '../documents/dtos/create-patient-document.dto';
import { PatientDocumentDto } from '../documents/dtos/patient-document.dto';
import { PatientDocumentPaginatedDto } from '../documents/dtos/patient-document-paginated.dto';
import { PatientDocumentAvailableFiltersDto } from '../documents/dtos/patient-document-available-filters.dto';
import { RenamePatientDocumentDto } from '../documents/dtos/rename-patient-document.dto';
import { QueryParamsTransformPipe } from '../documents/pipes/query-params-transform.pipe';
import { GrantedInstitutionDetailDto } from './dtos/granted-institution-detail.dto';
import { GrantedInstitutionPaginatedDto } from './dtos/granted-institution-paginated.dto';
import { InstitutionGrantService } from './institution-grant.service';

@ApiTags('Concessoes Paciente-Instituicao')
@ApiBearerAuth()
@Controller(InstitutionGrantPaths.BASE)
export class InstitutionGrantController {
  constructor(private readonly service: InstitutionGrantService) {}

  @Patch(InstitutionGrantPaths.LIKE)
  @Roles(UserRole.PATIENT, UserRole.INSTITUTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Curtir concessao de acesso',
    description:
      'Alterna o estado de curtida na concessao entre paciente e instituicao. ' +
      'Pacientes alternam likedByPatient, instituicoes alternam likedByInstitution.',
  })
  @ApiParam({ name: 'id', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Curtida alternada com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async toggleLike(
    @IsUUIDParam('id') grantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ): Promise<void> {
    await this.service.toggleLike(grantId, userId, userRole);
  }

  // Documentos via concessao (instituicao gerencia em nome do paciente)

  @Post(InstitutionGrantPaths.DOCUMENTS)
  @Roles(UserRole.INSTITUTION, UserRole.PATIENT)
  @HttpCode(HttpStatus.CREATED)
  @Auditable({
    eventType: AuditEventType.CREATE,
    entityName: 'PatientDocument',
    mode: 'success',
    dataExtractor: ({ body }) => ({
      type: body.type,
      description: body.description,
      examDate: body.examDate,
    }),
  })
  @ApiOperation({
    summary: 'Criar documento para paciente via concessao',
    description: 'Cria um documento medico do paciente em nome da instituicao.',
  })
  @ApiParam({ name: 'id', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiBody({ type: CreatePatientDocumentDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: PatientDocumentDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async createDocument(
    @IsUUIDParam('id') grantId: string,
    @Body() dto: CreatePatientDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<PatientDocumentDto> {
    return this.service.createDocument(userId, grantId, dto);
  }

  @Put(InstitutionGrantPaths.DOCUMENTS)
  @Roles(UserRole.INSTITUTION, UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  @Auditable({
    eventType: AuditEventType.UPDATE,
    entityName: 'PatientDocument',
    mode: 'success',
    dataExtractor: ({ body }) => ({
      id: body.id,
      type: body.type,
      description: body.description,
    }),
  })
  @ApiOperation({
    summary: 'Atualizar documento do paciente via concessao',
    description: 'Atualiza um documento medico do paciente em nome da instituicao.',
  })
  @ApiParam({ name: 'id', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiBody({ type: PatientDocumentDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Documento atualizado com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async updateDocument(
    @IsUUIDParam('id') grantId: string,
    @Body() dto: PatientDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.service.updateDocument(userId, grantId, dto);
  }

  @Patch(InstitutionGrantPaths.DOCUMENT_RENAME)
  @Roles(UserRole.INSTITUTION, UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  @Auditable({
    eventType: AuditEventType.UPDATE,
    entityName: 'PatientDocument',
    mode: 'success',
    dataExtractor: ({ params, body }) => ({
      documentId: params.documentId,
      description: body.description,
    }),
  })
  @ApiOperation({
    summary: 'Renomear documento do paciente via concessao',
    description: 'Altera a descricao de um documento medico do paciente em nome da instituicao.',
  })
  @ApiParam({ name: 'id', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiParam({ name: 'documentId', description: 'ID do documento', format: 'uuid', type: String })
  @ApiBody({ type: RenamePatientDocumentDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Documento renomeado com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async renameDocument(
    @IsUUIDParam('id') grantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Body() dto: RenamePatientDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.service.renameDocument(userId, grantId, documentId, dto.description);
  }

  @Get(InstitutionGrantPaths.DOCUMENT_FILTERS)
  @Roles(UserRole.INSTITUTION, UserRole.PATIENT)
  @NoCache()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter filtros disponiveis via concessao (instituicao)',
    description: 'Retorna os filtros disponiveis para os documentos do paciente acessiveis pela instituicao.',
  })
  @ApiParam({ name: 'id', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiResponse({ status: HttpStatus.OK, type: PatientDocumentAvailableFiltersDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async findAvailableFilters(
    @IsUUIDParam('id') grantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<PatientDocumentAvailableFiltersDto> {
    return this.service.findAvailableFilters(userId, grantId);
  }

  @Get(InstitutionGrantPaths.DOCUMENTS)
  @Roles(UserRole.INSTITUTION, UserRole.PATIENT)
  @NoCache()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar documentos via concessao (instituicao)',
    description:
      'Retorna os documentos do paciente acessiveis pela instituicao conforme as regras da concessao. ' +
      'Se allowAccessToAllDocuments=true, retorna todos os documentos. ' +
      'Se persistent=true, retorna documentos criados apos a concessao; ' +
      'caso contrario, apenas os documentos explicitamente liberados.',
  })
  @ApiParam({ name: 'id', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiResponse({ status: HttpStatus.OK, type: PatientDocumentPaginatedDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async findDocuments(
    @IsUUIDParam('id') grantId: string,
    @CurrentUser('id') userId: string,
    @Query(QueryParamsTransformPipe) params: any,
  ): Promise<PatientDocumentPaginatedDto> {
    return this.service.findDocuments(userId, grantId, params);
  }

  @Get(InstitutionGrantPaths.DOCUMENT_BY_ID)
  @Roles(UserRole.INSTITUTION, UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter documento via concessao (instituicao)' })
  @ApiParam({ name: 'id', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiParam({ name: 'documentId', description: 'ID do documento', format: 'uuid', type: String })
  @ApiResponse({ status: HttpStatus.OK, type: PatientDocumentDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async findDocumentById(
    @IsUUIDParam('id') grantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<PatientDocumentDto> {
    return this.service.findDocumentById(userId, grantId, documentId);
  }

  @Get(InstitutionGrantPaths.DOCUMENT_STREAM)
  @Roles(UserRole.INSTITUTION, UserRole.PATIENT)
  @NoCache()
  @ApiProduces('application/octet-stream', 'video/*', 'image/*', 'application/pdf')
  @ApiOperation({ summary: 'Stream de arquivo via concessao (instituicao)' })
  @ApiParam({ name: 'id', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiParam({ name: 'documentId', description: 'ID do documento', format: 'uuid', type: String })
  @ApiParam({ name: 'mediaId', description: 'ID da midia', format: 'uuid', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stream do arquivo.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async getStream(
    @IsUUIDParam('id') grantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @CurrentUser('id') userId: string,
  ): Promise<StreamableFile> {
    const streamData = await this.service.getStream(userId, grantId, documentId, mediaId);
    if (!streamData) throw new NotFoundException('Arquivo nao encontrado');
    return new StreamableFile(streamData.stream, {
      disposition: `inline; filename="${streamData.filename}"`,
      type: streamData.contentType,
    });
  }

  @Get(InstitutionGrantPaths.DOCUMENT_DOWNLOAD)
  @Roles(UserRole.INSTITUTION, UserRole.PATIENT)
  @NoCache()
  @ApiOperation({ summary: 'Download de documento via concessao (instituicao)' })
  @ApiParam({ name: 'id', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiParam({ name: 'documentId', description: 'ID do documento', format: 'uuid', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Arquivo para download.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async downloadDocument(
    @IsUUIDParam('id') grantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<StreamableFile> {
    const streamData = await this.service.downloadDocument(userId, grantId, documentId);
    return new StreamableFile(streamData.stream, {
      disposition: `attachment; filename="${streamData.filename}"`,
      type: streamData.contentType,
    });
  }

  // Paciente ve as instituicoes com acesso concedido

  @Get(InstitutionGrantPaths.GRANTED_INSTITUTIONS)
  @Roles(UserRole.PATIENT)
  @NoCache()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar instituicoes com acesso concedido',
    description:
      'Retorna as instituicoes que o paciente autenticado concedeu acesso aos seus dados. ' +
      'Suporta ordenacao por nome (A-Z / Z-A), busca por nome e filtros por tipo de instituicao e favoritos.',
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
    description: 'Número de itens por página (padrão: 10)',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo para ordenação. Use "name" para ordenar pelo nome da instituição.',
    type: String,
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Direção da ordenação: ASC (A-Z) ou DESC (Z-A)',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @ApiQuery({
    name: 'filter[name][ilike]',
    required: false,
    description: 'Buscar pelo nome da instituição (case-insensitive, use % para wildcards)',
    type: String,
    example: '%clinica%',
  })
  @ApiQuery({
    name: 'filter[medicalInstitutionType]',
    required: false,
    description: 'Filtrar pelo tipo de instituição médica',
    enum: MedicalInstitutionType,
    enumName: 'MedicalInstitutionType',
  })
  @ApiQuery({
    name: 'filter[otherMedicalInstitutionType][ilike]',
    required: false,
    description: 'Buscar na descrição customizada de tipo (somente quando tipo é "Outros")',
    type: String,
    example: '%especialidade%',
  })
  @ApiQuery({
    name: 'filter[liked]',
    required: false,
    description: 'Filtrar apenas instituições marcadas como favoritas pelo paciente',
    type: Boolean,
    example: true,
  })
  @ApiResponse({ status: HttpStatus.OK, type: GrantedInstitutionPaginatedDto })
  public async findGrantedInstitutionsPaginated(
    @CurrentUser('id') userId: string,
    @Query(QueryParamsTransformPipe) params: any,
  ): Promise<GrantedInstitutionPaginatedDto> {
    return this.service.findGrantedInstitutionsPaginated(userId, params);
  }

  @Get(InstitutionGrantPaths.GRANTED_INSTITUTION_BY_GRANT_ID)
  @Roles(UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter instituicao por ID da concessao' })
  @ApiParam({ name: 'grantId', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiResponse({ status: HttpStatus.OK, type: GrantedInstitutionDetailDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async findGrantedInstitutionByGrantId(
    @IsUUIDParam('grantId') grantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<GrantedInstitutionDetailDto> {
    return this.service.findGrantedInstitutionByGrantId(userId, grantId);
  }

  @Get(InstitutionGrantPaths.GRANTED_INSTITUTION_PROFILE_PICTURE)
  @Roles(UserRole.PATIENT)
  @NoCache()
  @ApiProduces('image/jpeg', 'image/png', 'image/gif')
  @ApiOperation({
    summary: 'Obter foto de perfil da instituicao via concessao',
    description:
      'Retorna a foto de perfil da instituicao a qual o paciente concedeu acesso. ' +
      'A concessao deve estar ativa (nao revogada). ' +
      'Retorna 404 se a instituicao nao possuir foto de perfil cadastrada.',
  })
  @ApiParam({ name: 'grantId', description: 'ID da concessao', format: 'uuid', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Imagem retornada com sucesso (stream binário).',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async getInstitutionProfilePicture(
    @IsUUIDParam('grantId') grantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<StreamableFile | null> {
    const mediaStreamResult =
      await this.service.getInstitutionProfilePictureByGrantId(userId, grantId);

    if (!mediaStreamResult) return null;

    return new StreamableFile(mediaStreamResult.stream, {
      type: mediaStreamResult.contentType,
      disposition: `inline; filename="${mediaStreamResult.filename}"`,
    });
  }
}