import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  provideIsArrayValidationMessage,
  provideIsBooleanValidationMessage,
  provideIsNumberValidationMessage,
  provideIsStringValidationMessage,
} from 'src/core/vo/consts/validation-messages';

class NavigatorDto {
  @IsString({ message: provideIsStringValidationMessage('userAgent') })
  userAgent: string;

  @IsOptional()
  @IsString({ message: provideIsStringValidationMessage('platform') })
  platform: string | null;

  @IsString({ message: provideIsStringValidationMessage('language') })
  language: string;

  @IsOptional()
  @IsArray({ message: provideIsArrayValidationMessage('languages') })
  @IsString({
    each: true,
    message: provideIsStringValidationMessage('languages'),
  })
  languages?: readonly string[];
}

class ScreenDto {
  @IsNumber({}, { message: provideIsNumberValidationMessage('width') })
  width: number;

  @IsNumber({}, { message: provideIsNumberValidationMessage('height') })
  height: number;

  @IsNumber({}, { message: provideIsNumberValidationMessage('pixelRatio') })
  pixelRatio: number;
}

class HardwareDto {
  @IsOptional()
  @IsNumber({}, { message: provideIsNumberValidationMessage('cores') })
  cores: number | null;

  @IsOptional()
  @IsNumber({}, { message: provideIsNumberValidationMessage('memory') })
  memory: number | null;

  @IsBoolean({ message: provideIsBooleanValidationMessage('touchSupport') })
  touchSupport: boolean;
}

export class ClientFingerprintDto {
  @IsString({ message: provideIsStringValidationMessage('version') })
  @IsIn(['v1'])
  version: 'v1';

  @ValidateNested()
  @Type(() => NavigatorDto)
  navigator: NavigatorDto;

  @ValidateNested()
  @Type(() => ScreenDto)
  screen: ScreenDto;

  @ValidateNested()
  @Type(() => HardwareDto)
  hardware: HardwareDto;

  @IsString()
  timezone: string;
}
