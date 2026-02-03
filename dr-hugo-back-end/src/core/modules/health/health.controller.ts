import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { HealthService } from './health.service';
import { HealthPaths } from '../../vo/consts/paths';
import { HealthDto } from './dtos/health.dto';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';

@ApiTags('Health Check')
@Public()
@Controller(HealthPaths.BASE)
export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    @Get()
    @ApiOperation({
        summary: 'Verificar status da aplicação',
        description: 'Retorna o status de saúde da aplicação e seus serviços dependentes (PostgreSQL, MinIO, Redis)'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Status da aplicação retornado com sucesso',
        type: HealthDto
    })
    @ApiResponse({
        status: HttpStatus.SERVICE_UNAVAILABLE,
        description: 'Um ou mais serviços estão indisponíveis',
        type: HealthDto
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Erro interno do servidor',
        type: ExceptionResponse
    })
    public async getHealth(): Promise<HealthDto> {
        return this.healthService.getHealth();
    }
}