import { ApiProperty } from '@nestjs/swagger';

export class MedicalDocumentDescriptionDto {
  @ApiProperty({
    description: 'Lista de descrições disponíveis para o tipo selecionado',
    type: [String],
  })
  public options: string[];

  @ApiProperty({
    description:
      'Indica se deve exibir campo de texto livre para o usuário digitar',
  })
  public allowCustomDescription: boolean;

  @ApiProperty({
    description: 'Total de itens disponíveis',
    example: 100,
  })
  public totalItems: number;

  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  public currentPage: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 10,
  })
  public totalPages: number;
}
