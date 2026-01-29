import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dtos/patient.dto';
import { PatientsService } from './patients.service';
import { PatientsPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { Public } from 'src/core/vo/decorators/public.decorator';

@ApiTags('Gerenciamento de Pacientes')
@ApiBearerAuth()
@Controller(PatientsPaths.BASE)
export class PatientsController extends BaseController<
  Patient,
  PatientDto,
  PatientsService
> {
  public constructor(patientsService: PatientsService) {
    super(patientsService);
  }

  @ApiOperation({ 
    summary: 'Criar novo paciente',
    description: 'Cria um novo paciente no sistema com todas as informações pessoais, dados de contato e aceitação de termos. Automaticamente cria um usuário associado.'
  })
  @ApiBody({
    description: 'Dados do paciente para criação',
    type: PatientDto
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Paciente criado com sucesso',
    type: PatientDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou malformados',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 409,
    description: 'Paciente já existe (email ou CPF/CNPJ duplicado)',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Dados não atendem aos critérios de validação',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() dto: PatientDto): Promise<PatientDto> {
    return this.service.create(dto);
  }
}
