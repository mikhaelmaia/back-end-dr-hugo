import { ApiProperty } from '@nestjs/swagger';
import { Gender } from 'src/core/vo/consts/enums';

export class GrantedDoctorDetailDto {
  @ApiProperty({
    description: 'Identificador da concessão',
    format: 'uuid',
    type: String,
  })
  public grantId: string;

  @ApiProperty({
    description: 'Identificador do médico',
    format: 'uuid',
    type: String,
  })
  public doctorId: string;

  @ApiProperty({
    description: 'Nome do médico',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Indica se o paciente curtiu a concessão',
    type: Boolean,
  })
  public liked: boolean;

  @ApiProperty({
    description: 'Especialidades ativas do médico',
    type: [String],
    example: ['Cardiologia', 'Neurologia'],
  })
  public specialties: string[];

  @ApiProperty({
    description: 'Gênero do médico',
    enum: Gender,
    enumName: 'Gender',
  })
  public gender: Gender;
}
