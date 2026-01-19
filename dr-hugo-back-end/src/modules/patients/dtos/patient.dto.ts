import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsDateString,
  IsOptional,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntityDto } from 'src/core/base/base.entity.dto';
import { Patient } from '../entities/patient.entity';
import { UserDto } from 'src/modules/users/dtos/user.dto';
import {
  provideIsNotEmptyValidationMessage,
  provideIsDateStringValidationMessage,
} from 'src/core/vo/consts/validation-messages';
import { IsNotBlacklisted } from 'src/core/vo/validators/is-not-blacklisted.validator';

export class PatientDto extends BaseEntityDto<Patient> {
  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Dados do Usuário'),
  })
  @ValidateNested()
  @Type(() => UserDto)
  @Expose()
  @ApiProperty({ description: 'Dados do usuário' })
  public user: UserDto;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Data de Nascimento'),
  })
  @IsDateString(
    {},
    {
      message: provideIsDateStringValidationMessage('Data de Nascimento'),
    },
  )
  @Expose()
  @ApiProperty({ description: 'Data de nascimento do paciente' })
  public birthDate: string;

  @IsNotEmpty({
    message: provideIsNotEmptyValidationMessage('Termos Aceitos'),
  })
  @IsArray({
    message: 'Termos aceitos deve ser um array',
  })
  @ArrayNotEmpty({
    message: 'Pelo menos um termo deve ser aceito',
  })
  @IsString({ each: true, message: 'Cada termo deve ser uma string' })
  @IsNotBlacklisted()
  @Expose()
  @ApiProperty({
    description: 'Lista de termos aceitos pelo paciente',
    type: [String],
    example: ['termo-uso-2024', 'politica-privacidade-2024'],
  })
  public acceptedTerms: string[];

  @IsOptional()
  @Expose()
  @ApiProperty({ description: 'ID da foto de perfil', required: false })
  public profilePictureId?: string;
}
