import { Expose, Transform } from 'class-transformer';

export class FingerprintResponseDto {
  @Expose()
  id: string;

  @Expose()
  fingerprintHash: string;

  @Expose()
  ip: string;

  @Expose()
  userAgent: string;

  @Expose()
  sessionId: string | null;

  @Expose()
  version: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: string;
}
