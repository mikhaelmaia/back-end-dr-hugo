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
import { Doctor } from './entities/doctor.entity';
import { DoctorDto } from './dtos/doctor.dto';
import { CreateDoctorDto } from './dtos/create-doctor.dto';
import { DoctorRegistrationValidationDto } from './dtos/doctor-registration-validation.dto';
import { DoctorRegistrationValidatedDto } from './dtos/doctor-registration-validated.dto';
import { DoctorService } from './doctor.service';
import { DoctorPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { Public } from 'src/core/vo/decorators/public.decorator';

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
    description: 'Consulta e valida os dados de registro do médico no Conselho Federal de Medicina (CFM). Este endpoint deve ser usado antes do cadastro do médico para garantir a veracidade dos dados.'
  })
  @ApiBody({
    description: 'Dados do registro médico para validação',
    type: DoctorRegistrationValidationDto
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validação realizada com sucesso',
    type: DoctorRegistrationValidatedDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos ou malformados',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Dados não atendem aos critérios de validação',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erro interno do servidor ou falha na comunicação com CFM',
    type: ExceptionResponse
  })
  @Public()
  @Post(DoctorPaths.LOOKUP)
  @HttpCode(HttpStatus.OK)
  public async lookupRegistration(@Body() dto: DoctorRegistrationValidationDto): Promise<DoctorRegistrationValidatedDto> {
    return this.service.lookupRegistration(dto);
  }

  @ApiOperation({ 
    summary: 'Criar novo médico',
    description: 'Cria um novo médico no sistema. Requer que o registro médico tenha sido validado previamente usando o endpoint de lookup. Automaticamente cria um usuário associado.'
  })
  @ApiBody({
    description: 'Dados do médico para criação',
    type: CreateDoctorDto
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Médico criado com sucesso',
    type: DoctorDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos, registro não validado ou malformados',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 409,
    description: 'Médico já existe (email ou CPF duplicado)',
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
  public async createDoctor(@Body() dto: CreateDoctorDto): Promise<DoctorDto> {
    return this.service.createDoctor(dto);
  }
}