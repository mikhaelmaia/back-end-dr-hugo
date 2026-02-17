import { ApiProperty } from '@nestjs/swagger';

export class PatientAccessCodeDto {
  @ApiProperty()
  public code: string;

  @ApiProperty({ nullable: true })
  public qrCode?: string;

  @ApiProperty()
  public expiresAt: Date;

  @ApiProperty()
  public totalTimeMs: number;

  @ApiProperty()
  public elapsedTimeMs: number;

  @ApiProperty()
  public remainingTimeMs: number;
}
