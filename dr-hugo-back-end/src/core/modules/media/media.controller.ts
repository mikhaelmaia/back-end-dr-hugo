import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { MediaDto } from './dtos/media.dto';
import { MediaPaths } from '../../vo/consts/paths';
import { ExceptionResponse } from '../../config/exceptions/exception-response';
import {
  multerSingleFileConfig,
  multerMultipleFilesConfig,
} from '../../config/media/multer.config';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';

@ApiTags('Gerenciamento de Mídia')
@ApiBearerAuth()
@Controller(MediaPaths.BASE)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({
    summary: 'Salvar arquivo temporário',
    description:
      'Permite o upload de um único arquivo para armazenamento temporário. O arquivo será salvo no bucket temporário e retornará os dados da mídia.',
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
          description:
            'Arquivo a ser carregado (imagem, documento, planilha, etc.)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Arquivo salvo temporariamente com sucesso',
    type: MediaDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo malformado, inválido ou tipo não suportado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, ausente ou expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 413,
    description: 'Arquivo muito grande (máximo 50MB)',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Post(MediaPaths.SAVE_TEMP)
  @UseInterceptors(FileInterceptor('file', multerSingleFileConfig))
  public async saveTemp(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ): Promise<MediaDto> {
    return await this.mediaService.createMedia(file, userId);
  }

  @ApiOperation({
    summary: 'Salvar múltiplos arquivos temporários',
    description:
      'Permite o upload de múltiplos arquivos (até 20) para armazenamento temporário. Os arquivos serão salvos no bucket temporário e retornará um array com os dados das mídias.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivos a serem enviados para o sistema',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Lista de arquivos a serem carregados (máximo 20 arquivos, 50MB cada)',
          maxItems: 20,
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Arquivos salvos temporariamente com sucesso',
    type: [MediaDto],
  })
  @ApiResponse({
    status: 400,
    description:
      'Um ou mais arquivos malformados, inválidos ou tipo não suportado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, ausente ou expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 413,
    description:
      'Arquivo muito grande (máximo 50MB cada) ou muitos arquivos (máximo 20)',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Post(MediaPaths.SAVE_TEMP_MULTIPLE)
  @UseInterceptors(FilesInterceptor('files', 20, multerMultipleFilesConfig))
  public async saveTempMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser('id') userId: string,
  ): Promise<MediaDto[]> {
    const mediaPromises = files.map((file) =>
      this.mediaService.createMedia(file, userId),
    );
    return await Promise.all(mediaPromises);
  }

  @ApiOperation({
    summary: 'Obter arquivo temporário',
    description:
      'Retorna o stream de um arquivo temporário específico. Apenas o proprietário do arquivo pode acessá-lo e somente arquivos no bucket temporário são permitidos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stream do arquivo temporário retornado com sucesso',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, ausente ou expirado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso negado - arquivo não é temporário ou não pertence ao usuário',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Arquivo temporário não encontrado',
    type: ExceptionResponse,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse,
  })
  @Get('/temp/:id/stream')
  public async getTempFileStream(
    @Param('id') mediaId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { stream, contentType, filename } =
      await this.mediaService.getTempFileStream(mediaId, userId);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
    });

    stream.pipe(res);
  }
}
