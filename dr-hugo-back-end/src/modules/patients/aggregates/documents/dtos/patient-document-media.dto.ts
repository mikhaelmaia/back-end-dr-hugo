import { ApiProperty } from '@nestjs/swagger';
import { MediaDto } from 'src/core/modules/media/dtos/media.dto';

export class PatientDocumentMediaDto {
  @ApiProperty({
    description: 'Dados da mídia',
    type: MediaDto,
  })
  public media: MediaDto;

  @ApiProperty({
    description: 'Ordem de exibição da mídia no documento',
    example: 0,
  })
  public order: number;

  @ApiProperty({
    description: 'Indica se é a mídia principal do documento',
    example: false,
  })
  public isPrimary: boolean;
}
