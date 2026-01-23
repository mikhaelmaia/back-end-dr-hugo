import { ApiProperty } from '@nestjs/swagger';

export class AuthResponse {
  @ApiProperty({ 
    description: 'Token JWT de acesso para autenticação nas requisições',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String
  })
  public accessToken: string;
  
  @ApiProperty({ 
    description: 'Token JWT para renovação do token de acesso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String
  })
  public refreshToken: string;
}
