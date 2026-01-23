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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dtos/patient.dto';
import { PatientsService } from './patients.service';
import { IsUUIDParam } from 'src/core/vo/decorators/is-uuid-param.decorator';
import { PatientsPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';

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
    status: 401, 
    description: 'Token de acesso inválido ou ausente',
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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() dto: PatientDto): Promise<PatientDto> {
    return this.service.create(dto);
  }

  @ApiOperation({ 
    summary: 'Buscar paciente por ID',
    description: 'Retorna os dados completos de um paciente específico através do seu identificador único.'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único do paciente (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paciente encontrado com sucesso',
    type: PatientDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID inválido (formato UUID inválido)',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de acesso inválido ou ausente',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Paciente não encontrado',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Get(PatientsPaths.FIND_BY_ID)
  @HttpCode(HttpStatus.OK)
  public async findById(@IsUUIDParam('id') id: string): Promise<PatientDto> {
    return this.service.findById(id);
  }

  @ApiOperation({ 
    summary: 'Buscar paciente por ID do usuário',
    description: 'Retorna os dados do paciente associado a um usuário específico. Pode retornar null se o usuário não possuir perfil de paciente.'
  })
  @ApiParam({
    name: 'userId',
    description: 'Identificador único do usuário (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Busca realizada com sucesso (pode retornar paciente ou null)',
    type: PatientDto,
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/PatientDto' },
        { type: 'null' }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID do usuário inválido (formato UUID inválido)',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de acesso inválido ou ausente',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Get(PatientsPaths.BY_USER)
  @HttpCode(HttpStatus.OK)
  public async findByUserId(
    @IsUUIDParam('userId') userId: string,
  ): Promise<PatientDto | null> {
    return this.service.findByUserId(userId);
  }

  @ApiOperation({ 
    summary: 'Atualizar dados do paciente',
    description: 'Atualiza os dados de um paciente existente. Todos os campos podem ser modificados, incluindo informações pessoais e de contato.'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único do paciente a ser atualizado (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({
    description: 'Dados atualizados do paciente',
    type: PatientDto
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Paciente atualizado com sucesso'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID inválido ou dados malformados',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de acesso inválido ou ausente',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Paciente não encontrado para atualização',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email ou CPF/CNPJ já em uso por outro usuário',
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
  @Put(PatientsPaths.UPDATE)
  @HttpCode(HttpStatus.OK)
  public async update(
    @IsUUIDParam('id') id: string,
    @Body() dto: PatientDto,
  ): Promise<void> {
    await this.service.update(id, dto);
  }

  @ApiOperation({ 
    summary: 'Excluir paciente',
    description: 'Realiza a exclusão lógica (soft delete) de um paciente. O registro é marcado como excluído mas mantido no banco de dados para auditoria.'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único do paciente a ser excluído (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Paciente excluído com sucesso (sem conteúdo)'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID inválido (formato UUID inválido)',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de acesso inválido ou ausente',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Paciente não encontrado para exclusão',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Delete(PatientsPaths.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @IsUUIDParam('id') id: string
  ): Promise<void> {
    await this.service.softDelete(id);
  }
}
