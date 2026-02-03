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
import { Institution } from './entities/institution.entity';
import { InstitutionDto } from './dtos/institution.dto';
import { CreateInstitutionDto } from './dtos/create-institution.dto';
import { InstitutionValidationDto } from './dtos/institution-validation.dto';
import { InstitutionValidatedDto } from './dtos/institution-validated.dto';
import { InstitutionService } from './institution.service';
import { InstitutionPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { Public } from 'src/core/vo/decorators/public.decorator';

@ApiTags('Gerenciamento de Instituições')
@ApiBearerAuth()
@Controller(InstitutionPaths.BASE)
export class InstitutionController extends BaseController<
  Institution,
  InstitutionDto,
  InstitutionService
> {
  public constructor(institutionService: InstitutionService) {
    super(institutionService);
  }

  @ApiOperation({ 
    summary: 'Validar CNPJ da instituição',
    description: 'Consulta e valida os dados da instituição na Receita Federal. Este endpoint deve ser usado antes do cadastro da instituição para garantir a veracidade dos dados.'
  })
  @ApiBody({
    description: 'CNPJ da instituição para validação',
    type: InstitutionValidationDto
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validação realizada com sucesso',
    type: InstitutionValidatedDto
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
    description: 'Erro interno do servidor ou falha na comunicação com Receita Federal',
    type: ExceptionResponse
  })
  @Public()
  @Post(InstitutionPaths.LOOKUP)
  @HttpCode(HttpStatus.OK)
  public async lookupTaxId(@Body() dto: InstitutionValidationDto): Promise<InstitutionValidatedDto> {
    return this.service.lookupTaxId(dto);
  }

  @ApiOperation({ 
    summary: 'Criar nova instituição',
    description: 'Cria uma nova instituição no sistema. Requer que o CNPJ tenha sido validado previamente usando o endpoint de lookup. Automaticamente cria um usuário associado.'
  })
  @ApiBody({
    description: 'Dados da instituição para criação',
    type: CreateInstitutionDto
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Instituição criada com sucesso',
    type: InstitutionDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos, CNPJ não validado ou malformados',
    type: ExceptionResponse
  })
  @ApiResponse({ 
    status: 409,
    description: 'Instituição já existe (email ou CNPJ duplicado)',
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
  public async createInstitution(@Body() dto: CreateInstitutionDto): Promise<InstitutionDto> {
    return this.service.createInstitution(dto);
  }
}