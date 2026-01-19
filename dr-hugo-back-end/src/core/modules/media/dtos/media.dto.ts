import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { BaseEntityDto } from '../../../base/base.entity.dto';
import { MediaType } from '../../../vo/consts/enums';
import { Media } from '../entities/media.entity';
import { ApiProperty } from '@nestjs/swagger';

export class MediaDto extends BaseEntityDto<Media> {
  @ApiProperty({ description: 'Nome do arquivo', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public filename: string;

  @ApiProperty({ description: 'Tipo do arquivo', enum: MediaType })
  public type: MediaType;

  @ApiProperty({ description: 'Tamanho do arquivo' })
  @IsInt()
  public size: number;

  @ApiProperty({ description: 'Bucket do MinIO' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public bucket: string;

  @ApiProperty({ description: 'Nome do objeto no MinIO' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  public objectName: string;
}
