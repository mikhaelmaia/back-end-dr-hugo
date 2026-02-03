import {
  IsObject,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClientFingerprintDto } from './client-fingerprint.dto';
import { provideIsStringValidationMessage } from 'src/core/vo/consts/validation-messages';

export class FingerprintRequestDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ClientFingerprintDto)
  public fingerprint: ClientFingerprintDto;

  @IsOptional()
  @IsString({ message: provideIsStringValidationMessage('sessionId') })
  public sessionId?: string;
}
