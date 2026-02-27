import { ApiProperty } from '@nestjs/swagger';

export class CnesExistsResponseDto {
  @ApiProperty({
    description:
      'Indica se já existe uma instituição cadastrada com o CNES informado',
    example: true,
    type: Boolean,
  })
  public exists: boolean;
}
