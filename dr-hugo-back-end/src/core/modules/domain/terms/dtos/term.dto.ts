import { ApiProperty } from '@nestjs/swagger';

export class TermDto {
  @ApiProperty({
    description: 'Título do termo (Política de Privacidade ou Termos de Serviço)',
    example: 'Política de Privacidade',
    type: String
  })
  title: string;

  @ApiProperty({
    description: 'Conteúdo completo do termo em formato HTML ou texto',
    example: '<h1>Política de Privacidade</h1><p>Esta política descreve como coletamos...</p>',
    type: String
  })
  content: string;

  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
}