import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { Doctor } from './entities/doctor.entity';
import { DoctorDto } from './dtos/doctor.dto';
import { CreateDoctorDto } from './dtos/create-doctor.dto';
import { DoctorRegistrationValidationDto } from './dtos/doctor-registration-validation.dto';
import { DoctorRegistrationValidatedDto } from './dtos/doctor-registration-validated.dto';
import { DoctorService } from './doctor.service';
import { DoctorPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { Auditable } from 'src/core/vo/decorators/auditable.decorator';
import { AuditEventType, UserRole } from 'src/core/vo/consts/enums';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { Roles } from 'src/core/vo/decorators/roles.decorator';

@ApiTags('Gerenciamento de Médicos')
@ApiBearerAuth()
@Controller(DoctorPaths.BASE)
export class DoctorController extends BaseController<
  Doctor,
  DoctorDto,
  DoctorService
> {
  public constructor(doctorService: DoctorService) {
    super(doctorService);
  }

  @ApiOperation({
    summary: 'Validar registro médico',
    description:
      'Consulta e valida os dados de registro do médico no Conselho Federal de Medicina (CFM). Este endpoint deve ser usado antes do cadastro do médico para garantir a veracidade dos dados.',
  })
  @ApiBody({
    description: 'Dados do registro médico para validação',
    type: DoctorRegistrationValidationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Validação realizada com sucesso',
    type: DoctorRegistrationValidatedDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou malformados',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Dados não atendem aos critérios de validação',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou falha na comunicação com CFM',
    type: ExceptionResponse,
  })
  @Public()
  @Post(DoctorPaths.LOOKUP)
  @HttpCode(HttpStatus.OK)
  public async lookupRegistration(
    @Body() dto: DoctorRegistrationValidationDto,
  ): Promise<DoctorRegistrationValidatedDto> {
    return this.service.lookupRegistration(dto);
  }

  @ApiOperation({
    summary: 'Criar novo médico',
    description:
      'Cria um novo médico no sistema. Requer que o registro médico tenha sido validado previamente usando o endpoint de lookup. Automaticamente cria um usuário associado.',
  })
  @ApiBody({
    description: 'Dados do médico para criação',
    type: CreateDoctorDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Médico criado com sucesso',
    type: DoctorDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos, registro não validado ou malformados',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'Médico já existe (email ou CPF duplicado)',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Dados não atendem aos critérios de validação',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.CREATE,
    entityName: 'Doctor',
    mode: 'success',

    entityIdExtractor: ({ result }) => result?.id ?? null,

    dataExtractor: ({ body, result }) => ({
      request: {
        email: body.email,
        birthDate: body.birthDate,
        acceptedTerms: body.acceptedTerms,
      },
      result: {
        id: result?.id,
        createdAt: result?.createdAt,
      },
    }),
  })
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async createDoctor(@Body() dto: CreateDoctorDto): Promise<DoctorDto> {
    return this.service.createDoctor(dto);
  }

  @ApiOperation({
    summary: 'Buscar dados do médico atual',
    description:
      'Retorna os dados completos do médico logado. Requer autenticação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do médico retornados com sucesso',
    type: DoctorDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Médico não encontrado para o usuário logado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Roles(UserRole.DOCTOR)
  @Get(DoctorPaths.CURRENT)
  @HttpCode(HttpStatus.OK)
  public async findCurrent(
    @CurrentUser('id') userId: string,
  ): Promise<DoctorDto> {
    return this.service.findDoctorByUserId(userId);
  }

  @ApiOperation({
    summary: 'Atualizar dados de registro do médico',
    description:
      'Atualiza os dados de registro e especializações do médico consultando o CFM. Gerencia especializações conforme regras de negócio. Requer autenticação de usuário do tipo Médico.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do médico atualizados com sucesso',
    type: DoctorDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao consultar dados no CFM',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas médicos podem usar este endpoint',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Médico não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.UPDATE,
    entityName: 'Doctor',
    mode: 'success',
    entityIdExtractor: ({ result }) => result?.id ?? null,
    dataExtractor: ({ result }) => ({
      result: {
        id: result?.id,
        updatedAt: new Date(),
        refreshedData: {
          registration: result?.registration,
        },
      },
    }),
  })
  @Roles(UserRole.DOCTOR)
  @Post(DoctorPaths.REFRESH_DATA)
  @HttpCode(HttpStatus.OK)
  public async refreshCurrentDoctorData(
    @CurrentUser('id') userId: string,
  ): Promise<DoctorDto> {
    return this.service.refreshCurrentDoctorData(userId);
  }

  @ApiOperation({
    summary: 'Alternar status de especialização',
    description:
      'Alterna o status ativo/inativo de uma especialização do médico. Aplica regras de negócio para generalistas e limites de especializações ativas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Status da especialização alternado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Operação não permitida devido às regras de negócio',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado - apenas médicos podem usar este endpoint',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Médico ou especialização não encontrados',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Roles(UserRole.DOCTOR)
  @Patch('/current/specialties/:id/toggle')
  @HttpCode(HttpStatus.OK)
  public async toggleSpecializationStatus(
    @CurrentUser('id') userId: string,
    @Param('id') specializationId: string,
  ): Promise<void> {
    await this.service.toggleSpecializationStatus(userId, specializationId);
  }
}
