import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ResolutionKeyService } from './resolution-key.service';
import {
  ResolutionKeyDto,
  ResolutionKeyResolvedDto,
} from './dtos/resolution-key.dto';
import { ResolutionKeyPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { Public } from 'src/core/vo/decorators/public.decorator';

@ApiTags('Gerenciamento de Chaves de Resolução')
@Controller(ResolutionKeyPaths.BASE)
export class ResolutionKeyController {
  constructor(private readonly resolution: ResolutionKeyService) {}

  @ApiOperation({
    summary: 'Resolver chave temporária',
    description:
      'Recupera os dados associados a uma chave de resolução e a invalida imediatamente após o uso. A chave só pode ser resolvida uma única vez e deve estar dentro do prazo de validade.',
  })
  @ApiBody({
    description: 'Chave para resolução',
    type: ResolutionKeyDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Chave resolvida com sucesso',
    type: ResolutionKeyResolvedDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Chave inválida, expirada ou já utilizada',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Formato de chave inválido',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou falha no cache',
    type: ExceptionResponse,
  })
  @Public()
  @Post(ResolutionKeyPaths.RESOLVE)
  @HttpCode(HttpStatus.OK)
  public async resolve(
    @Body() dto: ResolutionKeyDto,
  ): Promise<ResolutionKeyResolvedDto> {
    const data = await this.resolution.resolve(dto.key);

    return { data };
  }
}
