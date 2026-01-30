import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { BaseEntityDto } from '../../../base/base.entity.dto';
import { MediaType } from '../../../vo/consts/enums';
import { Media } from '../entities/media.entity';
import { ApiProperty } from '@nestjs/swagger';

export class MediaDto extends BaseEntityDto<Media> {
  @ApiProperty({ 
    description: 'Nome original do arquivo enviado pelo usuário',
    example: 'documento_importante.pdf',
    maxLength: 255,
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public filename: string;

  @ApiProperty({ 
    description: 'Tipo/extensão do arquivo baseado no conteúdo detectado',
    example: 'PDF',
    enum: MediaType,
    enumName: 'MediaType'
  })
  public type: MediaType;

  @ApiProperty({ 
    description: 'Tamanho do arquivo em bytes',
    example: 1048576,
    minimum: 1,
    type: Number
  })
  @IsInt()
  public size: number;

  @ApiProperty({ 
    description: 'Nome do bucket no sistema de armazenamento MinIO onde o arquivo está localizado',
    example: 'doutor-viu-media',
    maxLength: 100,
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public bucket: string;

  @ApiProperty({ 
    description: 'Identificador único do objeto no bucket MinIO (UUID com extensão)',
    example: '550e8400-e29b-41d4-a716-446655440000.pdf',
    maxLength: 500,
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  public objectName: string;

  @ApiProperty({ 
    description: 'Dados do arquivo codificados em base64 para renderização direta no front-end',
    example: 'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXM=',
    type: String
  })
  public data: string;

  @ApiProperty({ 
    description: 'Tipo MIME do arquivo para renderização adequada no navegador',
    example: 'application/pdf',
    type: String
  })
  public mimeType: string;
}
