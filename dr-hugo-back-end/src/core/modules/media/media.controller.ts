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
import { ApiTags } from '@nestjs/swagger';
import { IsUUIDParam } from '../../vo/decorators/is-uuid-param.decorator';
import { ApplicationResponse } from 'src/core/vo/types/types';

@ApiTags('Media Controller')
@Controller('media')
export class MediaController {
  public constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerSingleFileConfig))
  public async create(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApplicationResponse<MediaDto>> {
    return ApplicationResponse.success(
      await this.mediaService.createMedia(file),
    );
  }

  @Public()
  @Get(':id')
  public async findById(
    @IsUUIDParam('id') id: string,
  ): Promise<ApplicationResponse<MediaDto>> {
    return ApplicationResponse.success(await this.mediaService.findById(id));
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file', multerSingleFileConfig))
  public async update(
    @IsUUIDParam('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApplicationResponse<MediaDto>> {
    return ApplicationResponse.success(
      await this.mediaService.update(id, file),
    );
  }

  @Delete(':id')
  public async deleteById(
    @IsUUIDParam('id') id: string,
  ): Promise<ApplicationResponse<null>> {
    await this.mediaService.deleteById(id);
    return ApplicationResponse.success();
  }
}
