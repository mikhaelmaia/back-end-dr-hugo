import { ApiProperty } from '@nestjs/swagger';

export class NewPatientItemDto {
  @ApiProperty({
    description: 'Identificador da concessão',
    format: 'uuid',
    type: String,
  })
  public grantId: string;

  @ApiProperty({
    description: 'Nome do paciente',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Data em que a concessão foi criada',
    type: Date,
  })
  public grantedAt: Date;

  @ApiProperty({
    description:
      'Indica se o paciente é novo (concessão criada no mês corrente)',
    type: Boolean,
  })
  public newPatient: boolean;
}
