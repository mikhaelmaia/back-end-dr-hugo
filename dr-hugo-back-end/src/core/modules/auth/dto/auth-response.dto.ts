import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty({ description: 'Token de acesso', required: false })
  public accessToken: string;
  @ApiProperty({ description: 'Token de atualização', required: false })
  public refreshToken: string;
}
