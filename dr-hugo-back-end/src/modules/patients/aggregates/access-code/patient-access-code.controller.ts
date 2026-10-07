import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { PatientAccessCodeService } from './patient-access-code.service';
import { PatientAccessCodeDto } from './dtos/patient-access-code.dto';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { Roles } from 'src/core/vo/decorators/roles.decorator';
import { AuditEventType, UserRole } from 'src/core/vo/consts/enums';
import { Auditable } from 'src/core/vo/decorators/auditable.decorator';
import { PatientAccessCodePaths } from 'src/core/vo/consts/paths';
import { CreatePatientAccessCodeDto } from './dtos/create-patient-access-code.dto';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';

@ApiTags('Códigos de Acesso do Paciente')
@ApiBearerAuth()
@Controller(PatientAccessCodePaths.BASE)
export class PatientAccessCodeController {
  constructor(private readonly service: PatientAccessCodeService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar código de acesso temporário',
    description:
      'Gera um código alfanumérico de 6 dígitos com validade de 5 minutos para que ' +
      'profissionais de saúde (médicos ou instituições) possam acessar documentos específicos ' +
      'do paciente. O código é acompanhado de um QR Code para facilitar o compartilhamento. ' +
      'Apenas um código pode estar ativo por vez - códigos anteriores são invalidados.',
  })
  @ApiBody({
    type: CreatePatientAccessCodeDto,
    description: 'Dados para criação do código de acesso',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Código de acesso criado com sucesso. Inclui QR Code e informações de tempo de expiração.',
    type: PatientAccessCodeDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Dados de entrada inválidos (perfil inválido, documentos não encontrados, etc.)',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não é um paciente ou não tem permissão',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente não encontrado para o usuário atual',
    type: ExceptionResponse,
  })
  @Auditable({
    eventType: AuditEventType.CREATE,
    entityName: 'PatientAccessCode',
    mode: 'success',
    dataExtractor: ({ body, result }) => ({
      request: {
        role: body.role,
        documentIdsCount: body.documentIds?.length ?? 0,
      },
      result: {
        expiresAt: result?.expiresAt,
        role: result?.role,
      },
    }),
  })
  @Roles(UserRole.PATIENT)
  @HttpCode(HttpStatus.CREATED)
  public async createAccessCode(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePatientAccessCodeDto,
  ): Promise<PatientAccessCodeDto> {
    return this.service.createAccessCode(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Verificar código de acesso ativo',
    description:
      'Verifica se o paciente possui algum código de acesso ativo (não usado e não expirado). ' +
      'Útil para evitar criar múltiplos códigos desnecessariamente. Se existir código ativo, ' +
      'retorna os detalhes incluindo tempo restante. Se não existir, retorna null.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Consulta realizada com sucesso. Pode retornar código ativo ou null se não houver.',
    type: PatientAccessCodeDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não é um paciente ou não tem permissão',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Paciente não encontrado para o usuário atual',
    type: ExceptionResponse,
  })
  @Roles(UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  public async getExistingAccessCode(
    @CurrentUser('id') userId: string,
  ): Promise<PatientAccessCodeDto | null> {
    return this.service.getExistingAccessCode(userId);
  }

  @Delete()
  @ApiOperation({
    summary: 'Excluir código de acesso para paciente',
    description:
      'Exclui um código de acesso específico que não foi utilizado e ainda não expirou.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Código de acesso excluído com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Código de acesso não encontrado, já utilizado ou expirado.',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de autenticação inválido ou ausente',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não é um paciente ou não tem permissão',
    type: ExceptionResponse,
  })
  @Roles(UserRole.PATIENT)
  @HttpCode(HttpStatus.OK)
  public async deleteUnusedAndUnexpiredAccessCodeByPatientId(
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.service.deleteUnusedAndUnexpiredAccessCodeByPatientId(userId);
  }
}
