import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dtos/patient.dto';
import { PatientsRepository } from './patients.repository';
import { PatientsMapper } from './patients.mapper';
import { DataSource } from 'typeorm';
import { runInTransaction } from 'src/core/base/transaction-context';
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
    private readonly dataSource: DataSource,
  ) {
    super(patientsRepository, patientsMapper);
  }

  public override async create(dto: PatientDto): Promise<PatientDto> {
    const [pacient, user] = this.mapper.toEntityAndUser(dto);

    pacient.clearId();

    return runInTransaction(this.dataSource, async () => {
      const savedUser = await this.userService.create(user);

      pacient.user = {
        id: savedUser.id,
      } as any;

      const savedPatient = await this.repository.save(pacient);

      return this.mapper.toDtoWithUser(savedPatient, savedUser);
    });
  }

  public async findPatientIdByUserId(userId: string): Promise<string> {
    return Optional.ofNullable(
      await this.repository.findPatientIdByUserId(userId),
    ).orElseThrow(() => new NotFoundException(this.ENTITY_NOT_FOUND));
  }

  public async findPatientByUserId(userId: string): Promise<PatientDto> {
    const patientId = await this.findPatientIdByUserId(userId);
    return await this.findById(patientId);
  }
}
