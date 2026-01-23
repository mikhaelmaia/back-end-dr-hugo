import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaDto } from './dtos/media.dto';
import { Public } from '../../vo/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerSingleFileConfig } from '../../config/media/multer.config';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiConsumes, 
  ApiBearerAuth,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { IsUUIDParam } from '../../vo/decorators/is-uuid-param.decorator';
import { MediaPaths } from '../../vo/consts/paths';
import { ExceptionResponse } from '../../config/exceptions/exception-response';

@ApiTags('Gerenciamento de Mídias')
@ApiBearerAuth()
@Controller(MediaPaths.BASE)
export class MediaController {
  public constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({
    summary: 'Criar nova mídia',
    description: 'Realiza o upload e criação de uma nova mídia no sistema. Aceita diversos tipos de arquivo incluindo imagens, documentos e planilhas.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo a ser enviado para o sistema',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo a ser carregado (imagem, documento, planilha, etc.)'
        }
      },
      required: ['file']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Mídia criada com sucesso',
    type: MediaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido ou dados malformados',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou ausente',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 413,
    description: 'Arquivo muito grande',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 415,
    description: 'Tipo de arquivo não suportado',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Post()
  @UseInterceptors(FileInterceptor('file', multerSingleFileConfig))
  public async create(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MediaDto> {
    return await this.mediaService.createMedia(file);
  }

  @ApiOperation({
    summary: 'Buscar mídia por ID',
    description: 'Retorna os dados de uma mídia específica através do seu identificador único. Este endpoint é público e não requer autenticação.'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único da mídia (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Mídia encontrada com sucesso',
    type: MediaDto
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (formato UUID inválido)',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 404,
    description: 'Mídia não encontrada',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Public()
  @Get(MediaPaths.FIND_BY_ID)
  public async findById(@IsUUIDParam('id') id: string): Promise<MediaDto> {
    return await this.mediaService.findById(id);
  }

  @ApiOperation({
    summary: 'Atualizar mídia existente',
    description: 'Substitui o arquivo de uma mídia existente por um novo arquivo. O novo arquivo deve atender aos mesmos critérios de validação do upload original.'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único da mídia a ser atualizada (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Novo arquivo para substituir o existente',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Novo arquivo que substituirá o arquivo atual da mídia'
        }
      },
      required: ['file']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Mídia atualizada com sucesso',
    type: MediaDto
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido ou arquivo malformado',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido ou ausente',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 404,
    description: 'Mídia não encontrada para atualização',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 413,
    description: 'Arquivo muito grande',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 415,
    description: 'Tipo de arquivo não suportado',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Put(MediaPaths.UPDATE)
  @UseInterceptors(FileInterceptor('file', multerSingleFileConfig))
  public async update(
    @IsUUIDParam('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<MediaDto> {
    return await this.mediaService.update(id, file);
  }

  @ApiOperation({
    summary: 'Excluir mídia',
    description: 'Remove permanentemente uma mídia do sistema, incluindo o arquivo armazenado. Esta ação não pode ser desfeita.'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único da mídia a ser excluída (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 204,
    description: 'Mídia excluída com sucesso (sem conteúdo)'
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
    description: 'Mídia não encontrada para exclusão',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Delete(MediaPaths.DELETE)
  public async deleteById(@IsUUIDParam('id') id: string): Promise<void> {
    await this.mediaService.deleteById(id);
  }
}
