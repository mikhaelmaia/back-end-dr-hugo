import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
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
import { Auditable } from 'src/core/vo/decorators/auditable.decorator';
import { AuditEventType } from 'src/core/vo/consts/enums';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { AddressDto } from 'src/core/modules/address/dtos/address.dto';

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
    description:
      'Consulta e valida os dados da instituição na Receita Federal. Este endpoint deve ser usado antes do cadastro da instituição para garantir a veracidade dos dados.',
  })
  @ApiBody({
    description: 'CNPJ da instituição para validação',
    type: InstitutionValidationDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Validação realizada com sucesso',
    type: InstitutionValidatedDto,
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
    description:
      'Erro interno do servidor ou falha na comunicação com Receita Federal',
    type: ExceptionResponse,
  })
  @Public()
  @Post(InstitutionPaths.LOOKUP)
  @HttpCode(HttpStatus.OK)
  public async lookupTaxId(
    @Body() dto: InstitutionValidationDto,
  ): Promise<InstitutionValidatedDto> {
    return this.service.lookupTaxId(dto);
  }

  @ApiOperation({
    summary: 'Criar nova instituição',
    description:
      'Cria uma nova instituição no sistema. Requer que o CNPJ tenha sido validado previamente usando o endpoint de lookup. Automaticamente cria um usuário associado.',
  })
  @ApiBody({
    description: 'Dados da instituição para criação',
    type: CreateInstitutionDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Instituição criada com sucesso',
    type: InstitutionDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos, CNPJ não validado ou malformados',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 409,
    description: 'Instituição já existe (email ou CNPJ duplicado)',
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
    entityName: 'Institution',
    mode: 'success',

    entityIdExtractor: ({ result }) => result?.id ?? null,

    dataExtractor: ({ body, result }) => ({
      request: {
        email: body.email,
        acceptedTerms: body.acceptedTerms,
        cnes: body.cnes,
        medicalInstitutionType: body.medicalInstitutionType,
        otherMedicalInstitutionType: body.otherMedicalInstitutionType,
        address: body.address,
        representative: body.representative,
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
  public async createInstitution(
    @Body() dto: CreateInstitutionDto,
  ): Promise<InstitutionDto> {
    return this.service.createInstitution(dto);
  }

  @ApiOperation({
    summary: 'Buscar dados da instituição atual',
    description:
      'Retorna os dados completos da instituição logada. Requer autenticação.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados da instituição retornados com sucesso',
    type: InstitutionDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Instituição não encontrada para o usuário logado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Get(InstitutionPaths.CURRENT)
  @HttpCode(HttpStatus.OK)
  public async findCurrent(
    @CurrentUser('id') userId: string,
  ): Promise<InstitutionDto> {
    return this.service.findInstitutionByUserId(userId);
  }

  @ApiOperation({
    summary: 'Atualizar endereço da instituição atual',
    description:
      'Atualiza o endereço da instituição logada utilizando uma operação atômica. Requer autenticação.',
  })
  @ApiBody({
    description: 'Novos dados do endereço da instituição',
    type: AddressDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Endereço da instituição atualizado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de endereço inválidos ou malformados',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Instituição não encontrada para o usuário logado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Dados do endereço não atendem aos critérios de validação',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.UPDATE,
    entityName: 'Institution',
    mode: 'success',
    entityIdExtractor: ({ result }) => result?.id ?? null,
    dataExtractor: ({ body, result }) => ({
      request: {
        address: body,
      },
      result: {
        id: result?.id,
        updatedAt: result?.updatedAt,
      },
    }),
  })
  @Patch(InstitutionPaths.UPDATE_ADDRESS)
  @HttpCode(HttpStatus.OK)
  public async updateCurrentAddress(
    @CurrentUser('id') userId: string,
    @Body() addressDto: AddressDto,
  ): Promise<void> {
    await this.service.updateCurrentUserAddress(userId, addressDto);
  }

  @ApiOperation({
    summary: 'Verificar se CNES já existe',
    description:
      'Verifica se já existe uma instituição cadastrada com o CNES informado. Este endpoint é útil para validação durante o processo de cadastro.',
  })
  @ApiBody({
    description: 'CNES para verificação',
    type: CheckCnesDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Verificação realizada com sucesso',
    type: CnesExistsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'CNES inválido ou malformado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'CNES não atende aos critérios de validação',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Public()
  @Post(InstitutionPaths.CHECK_CNES)
  @HttpCode(HttpStatus.OK)
  public async checkCnes(
    @Body() dto: CheckCnesDto,
  ): Promise<CnesExistsResponseDto> {
    const exists = await this.service.checkCnesExists(dto.cnes);
    return { exists };
  }
}
