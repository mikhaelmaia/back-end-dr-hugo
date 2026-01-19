import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/core/base/base.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dtos/patient.dto';
import { PatientsRepository } from './patients.repository';
import { PatientsMapper } from './patients.mapper';
import { UserService } from '../users/user.service';
import { UserMapper } from '../users/user.mapper';
import { AuditService } from 'src/core/modules/audit/audit.service';
import { AuditEventType } from 'src/core/vo/consts/enums';

@Injectable()
export class PatientsService extends BaseService<
  Patient,
  PatientDto,
  PatientsRepository,
  PatientsMapper
> {
  public constructor(
    patientsRepository: PatientsRepository,
    patientsMapper: PatientsMapper,
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
    private readonly auditService: AuditService,
  ) {
    super(patientsRepository, patientsMapper);
  }

  public async create(dto: PatientDto): Promise<PatientDto> {
    const existingPatient = await this.repository.findByUserEmail(
      dto.user.email,
    );
    if (existingPatient) {
      throw new ConflictException(
        'Já existe paciente cadastrado com este e-mail',
      );
    }

    // Criar o usuário através do serviço de usuários
    const userDto = await this.userService.create(dto.user);

    // Criar o paciente
    const patient = new Patient();
    patient.user = this.userMapper.toEntity(userDto);
    patient.birthDate = new Date(dto.birthDate);
    patient.emergencyPhone = dto.emergencyPhone;
    patient.acceptedTerms = dto.acceptedTerms;

    const savedPatient = await this.repository.save(patient);

    // Registrar auditoria
    await this.auditService.createAuditWithFingerprint({
      eventType: AuditEventType.CREATE,
      entityName: 'Patient',
      entityId: savedPatient.id,
      data: this.mapper.toDto(savedPatient),
      ...dto.auditData,
    });

    return this.mapper.toDto(savedPatient);
  }

  public async findByUserId(userId: string): Promise<PatientDto | null> {
    const patient = await this.repository.findByUserId(userId);
    return patient ? this.mapper.toDto(patient) : null;
  }

  public async findByUserEmail(email: string): Promise<PatientDto | null> {
    const patient = await this.repository.findByUserEmail(email);
    return patient ? this.mapper.toDto(patient) : null;
  }

  public async findById(id: string): Promise<PatientDto> {
    const patient = await this.repository.findWithRelations(id);
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }
    return this.mapper.toDto(patient);
  }

  public async update(id: string, dto: PatientDto): Promise<PatientDto> {
    const existingPatient = await this.repository.findWithRelations(id);
    if (!existingPatient) {
      throw new NotFoundException('Paciente não encontrado');
    }

    // Verificar se o email foi alterado e se já existe outro paciente com este email
    if (dto.user.email !== existingPatient.user.email) {
      const patientWithEmail = await this.repository.findByUserEmail(
        dto.user.email,
      );
      if (patientWithEmail && patientWithEmail.id !== id) {
        throw new ConflictException(
          'Já existe paciente cadastrado com este e-mail',
        );
      }
    }

    // Atualizar dados do usuário
    const updatedUser = await this.userService.update(
      existingPatient.user.id,
      dto.user,
    );

    // Atualizar dados do paciente
    existingPatient.birthDate = new Date(dto.birthDate);
    existingPatient.emergencyPhone = dto.emergencyPhone;
    existingPatient.acceptedTerms = dto.acceptedTerms;

    const savedPatient = await this.repository.save(existingPatient);

    // Registrar auditoria
    await this.auditService.createAuditWithFingerprint({
      eventType: AuditEventType.UPDATE,
      entityName: 'Patient',
      entityId: savedPatient.id,
      data: this.mapper.toDto(savedPatient),
      ...dto.auditData,
    });

    return this.mapper.toDto(savedPatient);
  }

  public async remove(id: string, auditData: any): Promise<void> {
    const patient = await this.repository.existsById(id);
    if (!(await this.repository.existsById(id))) {
      throw new NotFoundException('Paciente não encontrado');
    }

    // Soft delete do paciente
    await this.repository.softDelete(id);

    // Registrar auditoria
    await this.auditService.createAuditWithFingerprint({
      eventType: AuditEventType.DELETE,
      entityName: 'Patient',
      entityId: id,
      data: patientData,
      ...auditData,
    });
  }
}
