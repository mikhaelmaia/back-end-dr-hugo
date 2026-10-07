import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { UserRole } from 'src/core/vo/consts/enums';
import { InsightsPaths } from 'src/core/vo/consts/paths';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { IsUUIDParam } from 'src/core/vo/decorators/is-uuid-param.decorator';
import { NoCache } from 'src/core/vo/decorators/no-cache.decorator';
import { Roles } from 'src/core/vo/decorators/roles.decorator';
import { InsightsTotalsDto } from './dtos/insights-totals.dto';
import { NewPatientItemDto } from './dtos/new-patient-item.dto';
import { InsightsService } from './insights.service';

@ApiTags('Insights')
@ApiBearerAuth()
@Controller(InsightsPaths.BASE)
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  @Get(InsightsPaths.TOTALS)
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.INSTITUTION)
  @NoCache()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter totais de insights',
    description:
      'Retorna os totais de acordo com o perfil do usuário autenticado. ' +
      'Para pacientes: total de documentos, médicos com acesso ativo e instituições com acesso ativo. ' +
      'Para médicos: total de pacientes com acesso ativo e total de novos pacientes no mês corrente. ' +
      'Para instituições: total de pacientes com acesso ativo e total de novos pacientes no mês corrente.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: InsightsTotalsDto,
  })
  public async getTotals(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ): Promise<InsightsTotalsDto> {
    return this.service.getTotals(userId, userRole);
  }

  @Get(InsightsPaths.NEW_PATIENTS)
  @Roles(UserRole.DOCTOR, UserRole.INSTITUTION)
  @NoCache()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter últimos pacientes vinculados',
    description:
      'Retorna os últimos 5 pacientes que concederam acesso ao médico ou instituição autenticado (concessões ativas). ' +
      'O campo newPatient indica se a concessão foi criada no mês corrente (calculado por mês, não por 30 dias). ' +
      'Disponível apenas para médicos e instituições.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [NewPatientItemDto],
  })
  public async getNewPatients(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ): Promise<NewPatientItemDto[]> {
    return this.service.getNewPatients(userId, userRole);
  }

  @Get(InsightsPaths.PATIENT_PROFILE_PICTURE)
  @Roles(UserRole.DOCTOR, UserRole.INSTITUTION)
  @NoCache()
  @ApiProduces('image/jpeg', 'image/png', 'image/gif')
  @ApiOperation({
    summary: 'Obter foto de perfil do paciente via concessão',
    description:
      'Retorna a foto de perfil do paciente ao qual o médico ou instituição tem acesso concedido. ' +
      'A concessão deve estar ativa (não revogada). ' +
      'Retorna 404 se a concessão não existir ou não pertencer ao usuário autenticado. ' +
      'Retorna 404 se o paciente não possuir foto de perfil cadastrada. ' +
      'Disponível apenas para médicos e instituições.',
  })
  @ApiParam({
    name: 'grantId',
    description: 'ID da concessão',
    format: 'uuid',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Imagem retornada com sucesso (stream binário).',
    schema: { type: 'string', format: 'binary' },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Concessão não encontrada ou paciente sem foto de perfil.',
    type: ExceptionResponse,
  })
  public async getPatientProfilePicture(
    @IsUUIDParam('grantId') grantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ): Promise<StreamableFile | null> {
    const mediaStreamResult = await this.service.getPatientProfilePicture(
      userId,
      userRole,
      grantId,
    );

    if (!mediaStreamResult) return null;

    return new StreamableFile(mediaStreamResult.stream, {
      type: mediaStreamResult.contentType,
      disposition: `inline; filename="${mediaStreamResult.filename}"`,
    });
  }
}
