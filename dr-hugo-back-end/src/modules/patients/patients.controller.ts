import {
  Controller,
  Post,
  Body,
  Put,
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

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar paciente' })
  @ApiResponse({ status: 200, description: 'Paciente atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  @ApiResponse({ status: 409, description: 'Email já em uso' })
  public async update(
    @IsUUIDParam('id') id: string,
    @Body() dto: PatientDto,
  ): Promise<void> {
    await this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir paciente' })
  @ApiResponse({ status: 204, description: 'Paciente excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Paciente não encontrado' })
  public async delete(
    @IsUUIDParam('id') id: string
  ): Promise<void> {
    await this.service.softDelete(id);
  }
}
