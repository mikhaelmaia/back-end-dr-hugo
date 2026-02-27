import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { DoctorRepository } from './doctor.repository';
import { DoctorMapper } from './doctor.mapper';
import { DoctorAdapter } from './doctor.adapter';
import { DoctorDto } from './dtos/doctor.dto';
import { Doctor } from './entities/doctor.entity';
import { DoctorRegistrationValidatedDto } from './dtos/doctor-registration-validated.dto';
import { DoctorRegistrationValidationDto } from './dtos/doctor-registration-validation.dto';
import { CreateDoctorDto } from './dtos/create-doctor.dto';
import { UserService } from '../users/user.service';
import { whenNullThrows } from 'src/core/utils/functions';
import { Optional } from 'src/core/utils/optional';
import { DataSource } from 'typeorm';

@Injectable()
export class DoctorService extends BaseService<
  Doctor,
  DoctorDto,
  DoctorRepository,
  DoctorMapper
> {
  protected override ENTITY_NOT_FOUND = 'Médico não encontrado';

  private readonly LOOKUP_REGISTRATION_IS_MANDATORY_MESSAGE =
    'Validação do registro do médico é obrigatória.';

  constructor(
    doctorRepository: DoctorRepository,
    doctorMapper: DoctorMapper,
    private readonly doctorAdapter: DoctorAdapter,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {
    super(doctorRepository, doctorMapper);
  }

  public async lookupRegistration(
    dto: DoctorRegistrationValidationDto,
  ): Promise<DoctorRegistrationValidatedDto> {
    return this.doctorAdapter.lookupRegistration(dto);
  }

  public async createDoctor(dto: CreateDoctorDto): Promise<DoctorDto> {
    const lookedUp = await this.doctorAdapter.getLookedRegistration(dto.taxId);

    whenNullThrows(
      lookedUp,
      () =>
        new BadRequestException(this.LOOKUP_REGISTRATION_IS_MANDATORY_MESSAGE),
    );

    const doctor = this.mapper.mapValidatedToDoctor(lookedUp);
    const [doctorToCreate, user] =
      this.mapper.mapCreationDtoToEntityAndUser(dto);

    user.name = lookedUp.data.name;
    doctor.birthDate = doctorToCreate.birthDate;

    doctor.clearId();

    const savedUser = await this.userService.create(user);

    doctor.user = {
      id: savedUser.id,
      isValid: lookedUp.valid,
    } as any;

    const savedDoctor = await this.repository.save(doctor);

    return this.mapper.toDto(savedDoctor);
  }

  public async findDoctorIdByUserId(userId: string): Promise<string> {
    return Optional.ofNullable(
      await this.repository.findDoctorIdByUserId(userId),
    ).orElseThrow(() => new NotFoundException(this.ENTITY_NOT_FOUND));
  }

  public async findDoctorByUserId(userId: string): Promise<DoctorDto> {
    const doctorId = await this.findDoctorIdByUserId(userId);
    return this.findById(doctorId);
  }

  public async refreshCurrentDoctorData(userId: string): Promise<DoctorDto> {
    return this.dataSource.transaction(async (manager) => {
      const doctorId = await this.repository.findDoctorIdByUserId(
        userId,
        manager,
      );

      if (!doctorId) {
        throw new NotFoundException(this.ENTITY_NOT_FOUND);
      }

      const registrationData =
        await this.repository.findDoctorRegistrationByUserId(userId, manager);

      const taxId = await this.repository.findUserTaxIdByUserId(
        userId,
        manager,
      );

      if (!registrationData || !taxId) {
        throw new NotFoundException('Dados do médico não encontrados');
      }

      const refreshed = await this.doctorAdapter.refreshRegistrationData({
        taxId,
        crm: registrationData.crm,
        state: registrationData.state,
        isGeneralist: false,
        specialties: [],
      });

      if (!refreshed.valid || !refreshed.data) {
        throw new BadRequestException(
          'Não foi possível atualizar os dados do médico',
        );
      }

      const mappedRegistration =
        this.mapper.mapRegistrationToDoctorRegistrationEntity(refreshed.data);

      await this.repository.updateDoctorRegistrationData(
        doctorId,
        {
          crm: mappedRegistration.crm,
          situation: mappedRegistration.situation,
          type: mappedRegistration.type,
          lastUpdate: mappedRegistration.lastUpdate,
          state: mappedRegistration.state,
        },
        manager,
      );

      const specialties = refreshed.data.specialties ?? [];

      const specsToSync = specialties.map((s, index) => ({
        name: s.name,
        rqe: s.rqe,
        isActive: index < 2,
      }));

      await this.repository.syncSpecializations(doctorId, specsToSync, manager);

      const isGeneralist = specialties.length === 0;

      await this.repository.updateIsGeneralist(doctorId, isGeneralist, manager);

      return this.mapper.toDto(
        await this.repository.findById(doctorId, manager),
      );
    });
  }

  public async toggleSpecializationStatus(
    userId: string,
    specializationId: string,
  ): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const doctorData = await this.repository.findDoctorDataByUserId(
        userId,
        manager,
      );

      if (!doctorData) {
        throw new NotFoundException(this.ENTITY_NOT_FOUND);
      }

      if (doctorData.isGeneralist) {
        throw new BadRequestException(
          'Médico generalista não pode alterar especializações.',
        );
      }

      const { specializations } = doctorData;

      const specialization = specializations.find(
        (s) => s.id === specializationId,
      );

      if (!specialization) {
        throw new NotFoundException('Especialização não encontrada');
      }

      const activeCount = specializations.filter((s) => s.isActive).length;

      if (specialization.isActive && activeCount === 1) {
        throw new BadRequestException(
          'Deve haver ao menos uma especialização ativa.',
        );
      }

      if (!specialization.isActive && activeCount >= 2) {
        throw new BadRequestException(
          'Máximo de duas especializações ativas permitido.',
        );
      }

      await this.repository.toggleSpecializationStatus(
        specializationId,
        manager,
      );
    });
  }
}
