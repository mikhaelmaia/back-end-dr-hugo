import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PatientAccessCodeService } from './patient-access-code.service';
import { PatientAccessCodeDto } from './dtos/patient-access-code.dto';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { Roles } from 'src/core/vo/decorators/roles.decorator';
import { UserRole } from 'src/core/vo/consts/enums';
import { PatientAccessCodePaths } from 'src/core/vo/consts/paths';

@ApiTags('Acesso do Paciente')
@ApiBearerAuth()
@Controller(PatientAccessCodePaths.BASE)
export class PatientAccessCodeController {
  constructor(private readonly service: PatientAccessCodeService) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar ou gerar código de acesso do paciente',
  })
  @ApiResponse({
    status: 200,
    type: PatientAccessCodeDto,
  })
  @Roles(UserRole.PATIENT)
  public async getAccessCode(
    @CurrentUser('id') userId: string,
    @Query('format') format?: 'text' | 'qr',
  ): Promise<PatientAccessCodeDto> {
    return this.service.getOrGenerate(userId, format === 'qr');
  }
}
