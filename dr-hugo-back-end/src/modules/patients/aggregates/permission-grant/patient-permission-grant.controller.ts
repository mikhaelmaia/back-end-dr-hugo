import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
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
import { AuditEventType, Gender, UserRole } from 'src/core/vo/consts/enums';
import { PatientPermissionGrantPaths } from 'src/core/vo/consts/paths';
import { Auditable } from 'src/core/vo/decorators/auditable.decorator';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { IsUUIDParam } from 'src/core/vo/decorators/is-uuid-param.decorator';
import { NoCache } from 'src/core/vo/decorators/no-cache.decorator';
import { Roles } from 'src/core/vo/decorators/roles.decorator';
import { UserDto } from 'src/modules/users/dtos/user.dto';
import { QueryParamsTransformPipe } from '../documents/pipes/query-params-transform.pipe';
import { CreatePatientPermissionGrantDto } from './dtos/create-patient-permission-grant.dto';
import { GrantedPatientDetailDto } from './dtos/granted-patient-detail.dto';
import { GrantedPatientMedicalRecordDto } from './dtos/granted-patient-medical-record.dto';
import { GrantedPatientPaginatedDto } from './dtos/granted-patient-paginated.dto';
import { PatientPermissionGrantDto } from './dtos/patient-permission-grant.dto';
import { RevokePatientPermissionGrantDto } from './dtos/revoke-patient-permission-grant.dto';
import { PatientPermissionGrantService } from './patient-permission-grant.service';

@ApiTags('Concessões de Acesso a Pacientes')
@ApiBearerAuth()
@Controller(PatientPermissionGrantPaths.BASE)
export class PatientPermissionGrantController {
  constructor(private readonly service: PatientPermissionGrantService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.INSTITUTION)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar concessão de acesso ao paciente',
    description:
      'Valida o token criptografado do QR Code gerado pelo paciente e cria o vínculo de ' +
      'acesso entre o paciente e o profissional (médico ou instituição). ' +
      'O token é obtido escaneando o QR Code do paciente e extraindo o parâmetro "t" da URL. ' +
      'Apenas médicos e instituições podem utilizar este endpoint.',
  })
  @ApiBody({
    type: CreatePatientPermissionGrantDto,
    description: 'Token criptografado do QR Code do paciente',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: PatientPermissionGrantDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Token inválido, expirado ou já utilizado.',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe uma concessão ativa.',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Código de acesso não encontrado.',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.CREATE,
    entityName: 'PatientPermissionGrant',
    mode: 'success',
    entityIdExtractor: ({ result }) => result?.id ?? null,
    dataExtractor: ({ result }) => ({
      result: {
        id: result?.id,
        patientId: result?.patientId,
        granteeId: result?.granteeId,
        role: result?.role,
      },
    }),
  })
  public async createGrant(
    @CurrentUser() currentUser: UserDto,
    @Body() dto: CreatePatientPermissionGrantDto,
  ): Promise<PatientPermissionGrantDto> {
    return this.service.createGrant(currentUser, dto);
  }

  @Patch(PatientPermissionGrantPaths.REVOKE)
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.INSTITUTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revogar concessão de acesso',
    description:
      'Revoga uma concessão de acesso. ' +
      'Pacientes podem revogar concessões que concederam. ' +
      'Médicos e instituições podem revogar concessões que receberam.',
  })
  @ApiBody({ type: RevokePatientPermissionGrantDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Concessão revogada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Concessão já foi revogada.',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Concessão não encontrada.',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.DELETE,
    entityName: 'PatientPermissionGrant',
    mode: 'success',
    entityIdExtractor: ({ body }) => body?.id ?? null,
    dataExtractor: ({ body }) => ({
      request: {
        grantId: body?.id,
        role: body?.role,
      },
    }),
  })
  public async revokeGrant(
    @CurrentUser() currentUser: UserDto,
    @Body() dto: RevokePatientPermissionGrantDto,
  ): Promise<void> {
    await this.service.revokeGrant(currentUser, dto);
  }

  @Patch(PatientPermissionGrantPaths.LIKE)
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.INSTITUTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Curtir concessão de acesso',
    description:
      'Alterna o estado de curtida na concessão. ' +
      'Pacientes alternam likedByPatient, médicos alternam likedByDoctor, instituições alternam likedByInstitution.',
  })
  @ApiParam({ name: 'id', description: 'ID da concessão', format: 'uuid', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Curtida alternada com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async toggleLike(
    @IsUUIDParam('id') grantId: string,
    @CurrentUser() currentUser: UserDto,
  ): Promise<void> {
    await this.service.toggleLike(grantId, currentUser);
  }

  @Get(PatientPermissionGrantPaths.PATIENTS)
  @Roles(UserRole.DOCTOR, UserRole.INSTITUTION)
  @NoCache()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Listar pacientes que concederam acesso',
    description:
      'Retorna os pacientes que concederam acesso ao médico ou instituição autenticado. ' +
      'Suporta ordenação por nome (A-Z / Z-A), busca por nome e filtros por idade, gênero e favoritos.',
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
    description: 'Campo para ordenação. Use "name" para ordenar pelo nome do paciente.',
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
    description: 'Buscar pelo nome do paciente (case-insensitive, use % para wildcards)',
    type: String,
    example: '%maria%',
  })
  @ApiQuery({
    name: 'filter[gender]',
    required: false,
    description: 'Filtrar pelo gênero do paciente',
    enum: Gender,
    enumName: 'Gender',
  })
  @ApiQuery({
    name: 'filter[minAge]',
    required: false,
    description: 'Idade mínima do paciente (inclusive). Faixas sugeridas: 0, 13, 18, 60',
    type: Number,
    example: 18,
  })
  @ApiQuery({
    name: 'filter[maxAge]',
    required: false,
    description: 'Idade máxima do paciente (inclusive). Faixas sugeridas: 12, 17, 59',
    type: Number,
    example: 59,
  })
  @ApiQuery({
    name: 'filter[liked]',
    required: false,
    description: 'Filtrar apenas pacientes que curtiram esta concessão',
    type: Boolean,
    example: true,
  })
  @ApiResponse({ status: HttpStatus.OK, type: GrantedPatientPaginatedDto })
  public async findGrantedPatientsPaginated(
    @CurrentUser() currentUser: UserDto,
    @Query(QueryParamsTransformPipe) params: any,
  ): Promise<GrantedPatientPaginatedDto> {
    return this.service.findGrantedPatientsPaginated(currentUser, params);
  }

  @Get(PatientPermissionGrantPaths.PATIENT_BY_GRANT_ID)
  @Roles(UserRole.DOCTOR, UserRole.INSTITUTION)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter paciente por ID da concessão' })
  @ApiParam({
    name: 'grantId',
    description: 'ID da concessão',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({ status: HttpStatus.OK, type: GrantedPatientDetailDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async findGrantedPatientByGrantId(
    @IsUUIDParam('grantId') grantId: string,
    @CurrentUser() currentUser: UserDto,
  ): Promise<GrantedPatientDetailDto> {
    return this.service.findGrantedPatientByGrantId(currentUser, grantId);
  }

  @Get(PatientPermissionGrantPaths.PATIENT_PROFILE_PICTURE)
  @Roles(UserRole.DOCTOR, UserRole.INSTITUTION)
  @NoCache()
  @ApiProduces('image/jpeg', 'image/png', 'image/gif')
  @ApiOperation({
    summary: 'Obter foto de perfil do paciente via concessão',
    description:
      'Retorna a foto de perfil do paciente ao qual o médico ou instituição tem acesso concedido. ' +
      'A concessão deve estar ativa (não revogada). ' +
      'Retorna 404 se o paciente não possuir foto de perfil cadastrada.',
  })
  @ApiParam({
    name: 'grantId',
    description: 'ID da concessão',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Imagem retornada com sucesso (stream binário).',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async getPatientProfilePicture(
    @IsUUIDParam('grantId') grantId: string,
    @CurrentUser() currentUser: UserDto,
  ): Promise<StreamableFile | null> {
    const mediaStreamResult =
      await this.service.getPatientProfilePictureByGrantId(
        currentUser,
        grantId,
      );

    if (!mediaStreamResult) return null;

    return new StreamableFile(mediaStreamResult.stream, {
      type: mediaStreamResult.contentType,
      disposition: `inline; filename="${mediaStreamResult.filename}"`,
    });
  }

  @Get(PatientPermissionGrantPaths.PATIENT_MEDICAL_RECORD)
  @Roles(UserRole.DOCTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter ficha médica do paciente via concessão',
    description:
      'Retorna os dados completos do paciente (nome, gênero, data de nascimento, contato) ' +
      'mesclados com a ficha médica (prontuário) do paciente ao qual o médico tem acesso concedido. ' +
      'A ficha médica pode ser nula caso o paciente ainda não tenha preenchido o prontuário. ' +
      'Acessível apenas por médicos com concessão ativa.',
  })
  @ApiParam({
    name: 'grantId',
    description: 'ID da concessão',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GrantedPatientMedicalRecordDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ExceptionResponse })
  public async getGrantedPatientMedicalRecord(
    @IsUUIDParam('grantId') grantId: string,
    @CurrentUser('id') userId: string,
  ): Promise<GrantedPatientMedicalRecordDto> {
    return this.service.getGrantedPatientMedicalRecord(userId, grantId);
  }
}
