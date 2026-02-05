import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PatientMedicalRecordDto } from './dtos/medical-record.dto';
import { PatientMedicalRecordService } from './medical-record.service';
import { MedicalRecordPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { Roles } from 'src/core/vo/decorators/roles.decorator';
import { UserRole } from 'src/core/vo/consts/enums';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';

@ApiTags('Prontuário Médico dos Pacientes')
@ApiBearerAuth()
@Controller(MedicalRecordPaths.BASE)
@Roles(UserRole.PATIENT)
export class PatientMedicalRecordController {
  public constructor(
    private readonly medicalRecordService: PatientMedicalRecordService,
  ) {}

  @ApiOperation({
    summary: 'Buscar prontuário médico do paciente',
    description:
      'Busca o prontuário médico completo de um paciente autenticado. Retorna todas as informações médicas como alergias, doenças crônicas, cirurgias, medicamentos, hábitos e histórico médico.',
  })
  @ApiResponse({
    status: 200,
    description: 'Prontuário médico encontrado com sucesso',
    type: PatientMedicalRecordDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para acessar este recurso',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  public async getMedicalRecordByUserId(
    @CurrentUser('id') userId: string,
  ): Promise<PatientMedicalRecordDto | null> {
    return this.medicalRecordService.findMedicalRecordByPatientUserId(userId);
  }

  @ApiOperation({
    summary: 'Atualizar prontuário médico do paciente',
    description:
      'Atualiza ou cria o prontuário médico completo de um paciente autenticado. Se o paciente ainda não possui prontuário, um novo será criado. Se já existe, os dados serão atualizados mantendo o histórico.',
  })
  @ApiBody({
    description: 'Dados completos do prontuário médico para atualização',
    type: PatientMedicalRecordDto,
  })
  @ApiResponse({
    status: 204,
    description: 'Prontuário médico atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou malformados no prontuário',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para acessar este recurso',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Dados do prontuário não atendem aos critérios de validação',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async updateMedicalRecordByUserId(
    @CurrentUser('id') userId: string,
    @Body() dto: PatientMedicalRecordDto,
  ): Promise<void> {
    return this.medicalRecordService.updateMedicalRecordByPatientUserId(
      dto,
      userId,
    );
  }
}
