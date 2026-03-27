import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePatientPermissionGrantDto {
  @ApiProperty({
    description:
      'Token criptografado obtido pelo QR Code gerado pelo paciente. ' +
      'Contém o código de acesso temporário que autoriza a criação do vínculo.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  @IsNotEmpty({ message: 'O token de acesso é obrigatório' })
  @IsString({ message: 'O token de acesso deve ser uma string' })
  public t: string;
}
