import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { Institution } from './entities/institution.entity';
import { InstitutionDto } from './dtos/institution.dto';
import { InstitutionRepository } from './institution.repository';
import { InstitutionMapper } from './institution.mapper';
import { InstitutionAdapter } from './institution.adapter';
import { InstitutionValidatedDto } from './dtos/institution-validated.dto';
import { InstitutionValidationDto } from './dtos/institution-validation.dto';
import { CreateInstitutionDto } from './dtos/create-institution.dto';
import { UserService } from '../users/user.service';
import { whenNullThrows } from 'src/core/utils/functions';

@Injectable()
export class InstitutionService extends BaseService<
  Institution,
  InstitutionDto,
  InstitutionRepository,
  InstitutionMapper
> {
  private readonly LOOKUP_VALIDATION_IS_MANDATORY_MESSAGE =
    'Validação do CNPJ da instituição é obrigatória. Por favor, realize a consulta antes de criar o cadastro da instituição.';

  public constructor(
    institutionRepository: InstitutionRepository,
    institutionMapper: InstitutionMapper,
    private readonly institutionAdapter: InstitutionAdapter,
    private readonly userService: UserService,
  ) {
    super(institutionRepository, institutionMapper);
  }

  public async lookupTaxId(
    institutionValidation: InstitutionValidationDto,
  ): Promise<InstitutionValidatedDto> {
    return this.institutionAdapter.lookupTaxId(institutionValidation.taxId);
  }

  public async createInstitution(
    institutionDto: CreateInstitutionDto,
  ): Promise<InstitutionDto> {
    const lookedUpValidation = await this.institutionAdapter.getValidation(
      institutionDto.taxId,
    );

    whenNullThrows(
      lookedUpValidation,
      () =>
        new BadRequestException(this.LOOKUP_VALIDATION_IS_MANDATORY_MESSAGE),
    );

    const institution =
      this.mapper.mapValidatedToInstitution(lookedUpValidation);

    const [institutionToCreate, user] =
      this.mapper.mapCreationDtoToEntityAndUser(institutionDto);

    user.name =
      lookedUpValidation.data.fantasyName ?? lookedUpValidation.data.name;
    institution.address = institutionToCreate.address;
    institution.cnes = institutionToCreate.cnes;
    institution.medicalInstitutionType =
      institutionToCreate.medicalInstitutionType;
    institution.otherMedicalInstitutionType =
      institutionToCreate.otherMedicalInstitutionType;

    if (institutionToCreate.company?.representative) {
      institution.company.representative =
        institutionToCreate.company.representative;
    }

    institution.clearId();

    const savedUser = await this.userService.create(user);

    institution.user = {
      id: savedUser.id,
      isValid: lookedUpValidation.valid,
    } as any;

    const savedInstitution = await this.repository.save(institution);

    return this.mapper.toDto(savedInstitution);
  }
}
