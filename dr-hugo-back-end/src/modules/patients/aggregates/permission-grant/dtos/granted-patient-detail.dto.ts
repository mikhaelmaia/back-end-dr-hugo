import { ApiProperty } from '@nestjs/swagger';
import { Gender } from 'src/core/vo/consts/enums';

export class GrantedPatientDetailDto {
  @ApiProperty({
    description: 'Identificador da concessão',
    format: 'uuid',
    type: String,
  })
  public grantId: string;

  @ApiProperty({
    description: 'Identificador do paciente',
    format: 'uuid',
    type: String,
  })
  public patientId: string;

  @ApiProperty({
    description: 'Nome do paciente',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Indica se o paciente curtiu esta concessão',
    type: Boolean,
  })
  public liked: boolean;

  @ApiProperty({
    description: 'Gênero do paciente',
    enum: Gender,
    enumName: 'Gender',
  })
  public gender: Gender;

  @ApiProperty({
    description: 'Data de nascimento do paciente',
    type: String,
    format: 'date',
    example: '1990-05-15',
  })
  public birthDate: Date;

  @ApiProperty({
    description: 'Idade do paciente calculada com base na data de nascimento',
    type: Number,
    example: 34,
  })
  public age: number;

  @ApiProperty({
    description: 'E-mail do paciente',
    type: String,
    example: 'paciente@email.com',
  })
  public email: string;

  @ApiProperty({
    description: 'Código do país (ex: BR)',
    type: String,
    example: 'BR',
  })
  public countryCode: string;

  @ApiProperty({
    description: 'DDI do país (ex: +55)',
    type: String,
    example: '+55',
  })
  public countryIdd: string;

  @ApiProperty({
    description: 'Número de telefone do paciente',
    type: String,
    example: '11999999999',
  })
  public phone: string;
}
