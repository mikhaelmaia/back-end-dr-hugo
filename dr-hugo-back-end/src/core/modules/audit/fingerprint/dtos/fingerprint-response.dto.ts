import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FingerprintResponseDto {
  @ApiProperty({
    description: 'Identificador único do fingerprint (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Hash único do fingerprint baseado nas características do dispositivo',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
  })
  @Expose()
  fingerprintHash: string;

  @ApiProperty({
    description: 'Endereço IP do cliente que executou a ação',
    example: '192.168.1.100'
  })
  @Expose()
  ip: string;

  @ApiProperty({
    description: 'User-Agent do navegador do cliente',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  @Expose()
  userAgent: string;

  @ApiProperty({
    description: 'Identificador da sessão do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
    required: false
  })
  @Expose()
  sessionId: string | null;

  @ApiProperty({
    description: 'Versão do algoritmo de fingerprint utilizado',
    example: '1.0'
  })
  @Expose()
  version: string;

  @ApiProperty({
    description: 'Data e hora de criação do fingerprint (ISO 8601)',
    example: '2026-01-23T10:30:00.000Z',
    format: 'date-time'
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: string;

  @ApiProperty({
    description: 'Data e hora da última atualização do fingerprint (ISO 8601)',
    example: '2026-01-23T15:45:30.000Z',
    format: 'date-time'
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: string;
}
