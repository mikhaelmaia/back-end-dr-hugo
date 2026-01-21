import {
  Controller,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dtos/patient.dto';
import { PatientsService } from './patients.service';
import { IsUUIDParam } from 'src/core/vo/decorators/is-uuid-param.decorator';
import { CreateAuditDto } from 'src/core/modules/audit/dtos/create-audit.dto';
import { Auditable } from 'src/core/vo/decorators/auditable.decorator';
import { AuditEventType } from 'src/core/vo/consts/enums';

@ApiTags('Módulo de Pacientes')
@Controller('patients')
export class PatientsController extends BaseController<
  Patient,
  PatientDto,
  PatientsService
> {
  public constructor(patientsService: PatientsService) {
    super(patientsService);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo paciente' })
  @ApiResponse({ status: 201, description: 'Paciente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Paciente já existe' })
  @Auditable({
    eventType: AuditEventType.CREATE,
    entityName: 'Patient',
    dataExtractor: ({ body, result }) => ({
      patientData: body,
      createdPatient: result,
    }),
  })
  public async create(@Body() dto: PatientDto): Promise<PatientDto> {
    return this.service.create(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  public async findById(@IsUUIDParam('id') id: string): Promise<PatientDto> {
    return this.service.findById(id);
  }

  @Get('by-user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar paciente por ID do usuário' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  public async findByUserId(
    @IsUUIDParam('userId') userId: string,
  ): Promise<PatientDto | null> {
    return this.service.findByUserId(userId);
  }

  @Get('by-email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar paciente por email' })
  @ApiResponse({ status: 200, description: 'Paciente encontrado' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  public async findByUserEmail(
    @Param('email') email: string,
  ): Promise<PatientDto | null> {
    return this.service.findByUserEmail(email);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar paciente' })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já em uso' })
  @Auditable({
    eventType: AuditEventType.UPDATE,
    entityName: 'Patient',
    entityIdExtractor: ({ params }) => params?.id,
    dataExtractor: ({ body, result, params }) => ({
      patientId: params?.id,
      changes: body,
      updatedPatient: result,
    }),
  })
  public async update(
    @IsUUIDParam('id') id: string,
    @Body() dto: PatientDto,
  ): Promise<PatientDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir paciente' })
  @ApiResponse({ status: 204, description: 'Paciente excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  @Auditable({
    eventType: AuditEventType.DELETE,
    entityName: 'Patient',
    entityIdExtractor: ({ params }) => params?.id,
    auditOnSuccessOnly: false,
    dataExtractor: ({ params, body }) => ({
      deletedPatientId: params?.id,
      auditMetadata: body,
    }),
  })
  public async remove(
    @IsUUIDParam('id') id: string,
    @Body() auditData: CreateAuditDto,
  ): Promise<void> {
    return this.service.remove(id, auditData);
  }
}
