import { Controller, Get, UploadedFile, UseInterceptors, Patch } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { BaseController } from 'src/core/base/base.controller';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { CurrentUser } from 'src/core/vo/decorators/current-user.decorator';
import { UserPaths } from 'src/core/vo/consts/paths';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerSingleFileConfig } from 'src/core/config/media/multer.config';
import { MediaDto } from 'src/core/modules/media/dtos/media.dto';

@ApiTags('Gerenciamento de Usuários')
@ApiBearerAuth()
@Controller(UserPaths.BASE)
export class UserController extends BaseController<User, UserDto, UserService> {
  public constructor(userService: UserService) {
    super(userService);
  }

  @ApiOperation({
    summary: 'Obter dados do usuário atual',
    description: 'Retorna os dados completos do usuário autenticado atualmente na sessão, incluindo informações pessoais e de perfil.'
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário atual retornados com sucesso',
    type: UserDto
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, ausente ou expirado',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado (sessão inválida)',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Get(UserPaths.CURRENT)
  public getCurrentUser(@CurrentUser() user: UserDto): UserDto {
    return user;
  }

  @ApiOperation({
    summary: 'Atualizar foto de perfil do usuário',
    description: 'Permite que o usuário autenticado atualize sua foto de perfil enviando um novo arquivo de imagem.'
  })
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
    status: 200,
    description: 'Foto de perfil atualizada com sucesso',
    type: MediaDto
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo malformado ou inválido',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, ausente ou expirado',
    type: ExceptionResponse
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    type: ExceptionResponse
  })
  @Patch(UserPaths.UPDATE_PROFILE_PICTURE)
  @UseInterceptors(FileInterceptor('file', multerSingleFileConfig))
  public async updateUserProfilePicture(@CurrentUser('id') userId: string, @UploadedFile() file: Express.Multer.File): Promise<MediaDto> {
    return await this.service.updateProfilePicture(userId, file);
  }
}
