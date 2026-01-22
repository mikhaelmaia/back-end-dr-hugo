import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dtos/patient.dto';
import { PatientsRepository } from './patients.repository';
import { PatientsMapper } from './patients.mapper';
import { UserService } from '../users/user.service';
import { Optional } from 'src/core/utils/optional';

@Injectable()
export class PatientsService extends BaseService<
  Patient,
  PatientDto,
  PatientsRepository,
  PatientsMapper
> {
  protected override ENTITY_NOT_FOUND: string = 'Paciente não encontrado';

  public constructor(
    patientsRepository: PatientsRepository,
    patientsMapper: PatientsMapper,
    private readonly userService: UserService,
  ) {
    super(patientsRepository, patientsMapper);
  }

  public override async create(dto: PatientDto): Promise<PatientDto> {
    const [ pacient, user ] = this.mapper.toEntityAndUser(dto);

    const savedUser = await this.userService.create(user);

    pacient.user = {
      id: savedUser.id,
    } as any;
    
    const savedPatient = await this.repository.save(pacient);

    return this.mapper.toDtoWithUser(savedPatient, savedUser);
  }

  public async findByUserId(userId: string): Promise<PatientDto | null> {
    return Optional.ofNullable(
      await this.repository.findByUserId(userId)
    ).map(
      (patient) => this.mapper.toDtoWithUser(patient, patient.user)
    ).orElseThrow(() => new NotFoundException(this.ENTITY_NOT_FOUND));
  }

  public override async findById(id: string): Promise<PatientDto> {
    return Optional.ofNullable(
      await this.repository.findById(id)
    ).map(
      (patient) => this.mapper.toDtoWithUser(patient, patient.user)
    ).orElseThrow(() => new NotFoundException(this.ENTITY_NOT_FOUND));
  }

  public override async update(id: string, dto: PatientDto): Promise<PatientDto> {
    const existingPatient = await this.repository.findById(id);

    if (!existingPatient) {
      throw new NotFoundException(this.ENTITY_NOT_FOUND);
    }

    const [ updatedPatientEntity, updatedUserEntity ] = this.mapper.toEntityAndUser(dto);

    const userId = existingPatient.user.id;

    const updatedUser = await this.userService.update(userId, updatedUserEntity);

    updatedPatientEntity.id = id;
    updatedPatientEntity.user = {
      id: userId,
    } as any;

    const savedPatient = await this.repository.save(updatedPatientEntity);

    return this.mapper.toDtoWithUser(savedPatient, updatedUser);
  }

  public override async postSoftDelete(entity: Patient): Promise<void> {
    await this.userService.softDelete(entity.user.id);
  }
}
