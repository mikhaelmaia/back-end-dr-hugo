import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import {
  DoctorSpecializationType,
  Gender,
  UserRole,
} from 'src/core/vo/consts/enums';
import { DoctorGrantPaths } from 'src/core/vo/consts/paths';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { IsUUIDParam } from 'src/core/vo/decorators/is-uuid-param.decorator';
import { NoCache } from 'src/core/vo/decorators/no-cache.decorator';
import { Roles } from 'src/core/vo/decorators/roles.decorator';
import { PatientDocumentDto } from '../documents/dtos/patient-document.dto';
import { PatientDocumentPaginatedDto } from '../documents/dtos/patient-document-paginated.dto';
import { PatientDocumentAvailableFiltersDto } from '../documents/dtos/patient-document-available-filters.dto';
import { QueryParamsTransformPipe } from '../documents/pipes/query-params-transform.pipe';
import { GrantedDoctorDetailDto } from './dtos/granted-doctor-detail.dto';
import { GrantedDoctorPaginatedDto } from './dtos/granted-doctor-paginated.dto';
import { DoctorGrantService } from './doctor-grant.service';

@ApiTags('Concessoes Paciente-Medico')
@ApiBearerAuth()
@Controller(DoctorGrantPaths.BASE)
export class DoctorGrantController {
  constructor(private readonly service: DoctorGrantService) {}

  @Patch(DoctorGrantPaths.LIKE)
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Curtir concessao de acesso',
    description:
      'Alterna o estado de curtida na concessao entre paciente e medico. ' +
      'Pacientes alternam likedByPatient, medicos alternam likedByDoctor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da concessao',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Curtida alternada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Concessao nao encontrada.',
    type: ExceptionResponse,
  })
  public async toggleLike(
    @IsUUIDParam('id') grantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ): Promise<void> {
    await this.service.toggleLike(grantId, userId, userRole);
  }

  // Documentos via concessao (medico, somente leitura)

  @Get(DoctorGrantPaths.DOCUMENT_FILTERS)
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  @NoCache()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter filtros disponiveis via concessao (medico)',
    description:
      'Retorna os filtros disponiveis para os documentos do paciente acessiveis ao medico.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da concessao',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PatientDocumentAvailableFiltersDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async findAvailableFilters(
    @IsUUIDParam('id') grantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<PatientDocumentAvailableFiltersDto> {
    return this.service.findAvailableFilters(userId, grantId);
  }

  @Get(DoctorGrantPaths.DOCUMENTS)
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  @NoCache()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar documentos via concessao (medico)',
    description:
      'Retorna os documentos do paciente acessiveis pelo medico conforme as regras da concessao. ' +
      'Se allowAccessToAllDocuments=true, retorna todos os documentos. ' +
      'Se persistent=true, retorna documentos criados apos a concessao; ' +
      'caso contrario, apenas os documentos explicitamente liberados.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da concessao',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({ status: HttpStatus.OK, type: PatientDocumentPaginatedDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async findDocuments(
    @IsUUIDParam('id') grantId: string,
    @CurrentUser('id') userId: string,
    @Query(QueryParamsTransformPipe) params: any,
  ): Promise<PatientDocumentPaginatedDto> {
    return this.service.findDocuments(userId, grantId, params);
  }

  @Get(DoctorGrantPaths.DOCUMENT_BY_ID)
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter documento via concessao (medico)' })
  @ApiParam({
    name: 'id',
    description: 'ID da concessao',
    format: 'uuid',
    type: String,
  })
  @ApiParam({
    name: 'documentId',
    description: 'ID do documento',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({ status: HttpStatus.OK, type: PatientDocumentDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async findDocumentById(
    @IsUUIDParam('id') grantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<PatientDocumentDto> {
    return this.service.findDocumentById(userId, grantId, documentId);
  }

  @Get(DoctorGrantPaths.DOCUMENT_STREAM)
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  @NoCache()
  @ApiProduces(
    'application/octet-stream',
    'video/*',
    'image/*',
    'application/pdf',
  )
  @ApiOperation({ summary: 'Stream de arquivo via concessao (medico)' })
  @ApiParam({
    name: 'id',
    description: 'ID da concessao',
    format: 'uuid',
    type: String,
  })
  @ApiParam({
    name: 'documentId',
    description: 'ID do documento',
    format: 'uuid',
    type: String,
  })
  @ApiParam({
    name: 'mediaId',
    description: 'ID da midia',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stream do arquivo.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async getStream(
    @IsUUIDParam('id') grantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @CurrentUser('id') userId: string,
  ): Promise<StreamableFile> {
    const streamData = await this.service.getStream(
      userId,
      grantId,
      documentId,
      mediaId,
    );
    if (!streamData) throw new NotFoundException('Arquivo nao encontrado');
    return new StreamableFile(streamData.stream, {
      disposition: `inline; filename="${streamData.filename}"`,
      type: streamData.contentType,
    });
  }

  @Get(DoctorGrantPaths.DOCUMENT_DOWNLOAD)
  @Roles(UserRole.DOCTOR, UserRole.PATIENT)
  @NoCache()
  @ApiOperation({ summary: 'Download de documento via concessao (medico)' })
  @ApiParam({
    name: 'id',
    description: 'ID da concessao',
    format: 'uuid',
    type: String,
  })
  @ApiParam({
    name: 'documentId',
    description: 'ID do documento',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Arquivo para download.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async downloadDocument(
    @IsUUIDParam('id') grantId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser('id') userId: string,
  ): Promise<StreamableFile> {
    const streamData = await this.service.downloadDocument(
      userId,
      grantId,
      documentId,
    );
    return new StreamableFile(streamData.stream, {
      disposition: `attachment; filename="${streamData.filename}"`,
      type: streamData.contentType,
    });
  }

  // Paciente ve os medicos com acesso concedido

  @Get(DoctorGrantPaths.GRANTED_DOCTORS)
  @Roles(UserRole.PATIENT)
  @NoCache()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar medicos com acesso concedido',
    description:
      'Retorna os medicos que o paciente autenticado concedeu acesso aos seus dados. ' +
      'Suporta ordenacao por nome (A-Z / Z-A), busca por nome e filtros por especialidade, genero e favoritos.',
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
    description:
      'Campo para ordenação. Use "name" para ordenar pelo nome do médico.',
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
    description:
      'Buscar pelo nome do médico (case-insensitive, use % para wildcards)',
    type: String,
    example: '%silva%',
  })
  @ApiQuery({
    name: 'filter[specialty]',
    required: false,
    description: 'Filtrar por especialidade ativa do médico',
    enum: DoctorSpecializationType,
    enumName: 'DoctorSpecializationType',
  })
  @ApiQuery({
    name: 'filter[gender]',
    required: false,
    description: 'Filtrar pelo gênero do médico',
    enum: Gender,
    enumName: 'Gender',
  })
  @ApiQuery({
    name: 'filter[liked]',
    required: false,
    description: 'Filtrar apenas médicos marcados como favoritos pelo paciente',
    type: Boolean,
    example: true,
  })
  @ApiResponse({ status: HttpStatus.OK, type: GrantedDoctorPaginatedDto })
  public async findGrantedDoctorsPaginated(
    @CurrentUser('id') userId: string,
    @Query(QueryParamsTransformPipe) params: any,
  ): Promise<GrantedDoctorPaginatedDto> {
    return this.service.findGrantedDoctorsPaginated(userId, params);
  }

  @Get(DoctorGrantPaths.GRANTED_DOCTOR_BY_GRANT_ID)
  @Roles(UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter medico por ID da concessao' })
  @ApiParam({
    name: 'grantId',
    description: 'ID da concessao',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({ status: HttpStatus.OK, type: GrantedDoctorDetailDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async findGrantedDoctorByGrantId(
    @IsUUIDParam('grantId') grantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<GrantedDoctorDetailDto> {
    return this.service.findGrantedDoctorByGrantId(userId, grantId);
  }

  @Get(DoctorGrantPaths.GRANTED_DOCTOR_PROFILE_PICTURE)
  @Roles(UserRole.PATIENT)
  @NoCache()
  @ApiProduces('image/jpeg', 'image/png', 'image/gif')
  @ApiOperation({
    summary: 'Obter foto de perfil do medico via concessao',
    description:
      'Retorna a foto de perfil do medico ao qual o paciente concedeu acesso. ' +
      'A concessao deve estar ativa (nao revogada). ' +
      'Retorna 404 se o medico nao possuir foto de perfil cadastrada.',
  })
  @ApiParam({
    name: 'grantId',
    description: 'ID da concessao',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Imagem retornada com sucesso (stream binário).',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async getDoctorProfilePicture(
    @IsUUIDParam('grantId') grantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<StreamableFile | null> {
    const mediaStreamResult =
      await this.service.getDoctorProfilePictureByGrantId(userId, grantId);

    if (!mediaStreamResult) return null;

    return new StreamableFile(mediaStreamResult.stream, {
      type: mediaStreamResult.contentType,
      disposition: `inline; filename="${mediaStreamResult.filename}"`,
    });
  }
}
