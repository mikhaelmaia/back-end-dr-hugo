import {
  Injectable,
} from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dtos/patient.dto';
import { PatientsRepository } from './patients.repository';
import { PatientsMapper } from './patients.mapper';
import { UserService } from '../users/user.service';

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

    pacient.clearId();

    const savedUser = await this.userService.create(user);

    pacient.user = {
      id: savedUser.id,
    } as any;
    
    const savedPatient = await this.repository.save(pacient);

    return this.mapper.toDtoWithUser(savedPatient, savedUser);
  }
}
