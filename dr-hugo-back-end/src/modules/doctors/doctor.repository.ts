import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { Doctor } from './entities/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import {
  BrazilianState,
  DoctorSpecializationType,
} from 'src/core/vo/consts/enums';
import { DoctorSpecialization } from './aggregates/specialization/entities/doctor-specialization.entity';

@Injectable()
export class DoctorRepository extends BaseRepository<Doctor> {
  protected override alias = 'doctor';

  public constructor(
    @InjectRepository(Doctor)
    doctorRepository: Repository<Doctor>,
  ) {
    super(doctorRepository);
  }

  public override findById(
    id: string,
    manager?: EntityManager,
  ): Promise<Doctor | null> {
    const repo = manager ? manager.getRepository(Doctor) : this.repository;

    return repo
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .leftJoinAndSelect('doctor.registration', 'registration')
      .leftJoinAndSelect('doctor.specializations', 'specializations')
      .where('doctor.id = :id', { id })
      .getOne();
  }

  public async findDoctorIdByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<string | null> {
    const repo = manager ? manager.getRepository(Doctor) : this.repository;

    const result = await repo
      .createQueryBuilder('doctor')
      .innerJoin('doctor.user', 'user')
      .select('doctor.id', 'doctorId')
      .where('user.id = :userId', { userId })
      .getRawOne<{ doctorId: string }>();

    return result?.doctorId ?? null;
  }

  public async findUserTaxIdByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<string | null> {
    const repo = manager ? manager.getRepository(Doctor) : this.repository;
    const result = await repo
      .createQueryBuilder('doctor')
      .innerJoin('doctor.user', 'user')
      .select('user.taxId', 'taxId')
      .where('user.id = :userId', { userId })
      .getRawOne<{ taxId: string }>();
    return result?.taxId ?? null;
  }

  public async findDoctorRegistrationByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<{ crm: string; state: BrazilianState } | null> {
    const repo = manager ? manager.getRepository(Doctor) : this.repository;

    const result = await repo
      .createQueryBuilder('doctor')
      .innerJoin('doctor.user', 'user')
      .innerJoin('doctor.registration', 'registration')
      .select(['registration.crm as crm', 'registration.state as state'])
      .where('user.id = :userId', { userId })
      .getRawOne<{ crm: string; state: BrazilianState }>();

    return result ?? null;
  }

  public async updateDoctorRegistrationData(
    doctorId: string,
    registrationData: {
      crm: string;
      situation: string;
      type: string;
      lastUpdate: Date;
      state: string;
    },
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ?? this.repository.manager;

    await repo
      .createQueryBuilder()
      .update('dv_doctor_registration')
      .set({
        crm: registrationData.crm,
        situation: registrationData.situation,
        type: registrationData.type,
        lastUpdate: registrationData.lastUpdate,
        state: registrationData.state,
      })
      .where(
        'id = (SELECT registration_id FROM dv_doctor WHERE id = :doctorId)',
        {
          doctorId,
        },
      )
      .execute();
  }

  public async syncSpecializations(
    doctorId: string,
    incoming: {
      name: DoctorSpecializationType;
      rqe: string;
      isActive: boolean;
    }[],
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ?? this.repository.manager;

    await repo
      .createQueryBuilder()
      .delete()
      .from(DoctorSpecialization)
      .where('doctor_id = :doctorId', { doctorId })
      .execute();

    if (incoming.length === 0) return;

    await repo
      .createQueryBuilder()
      .insert()
      .into(DoctorSpecialization)
      .values(
        incoming.map((s) => ({
          doctor: { id: doctorId } as Doctor,
          name: s.name,
          rqe: s.rqe,
          isActive: s.isActive,
        })),
      )
      .orIgnore()
      .execute();
  }

  public async updateIsGeneralist(
    doctorId: string,
    isGeneralist: boolean,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ?? this.repository.manager;

    await repo
      .createQueryBuilder()
      .update('dv_doctor')
      .set({ isGeneralist: isGeneralist })
      .where('id = :doctorId', { doctorId })
      .execute();
  }

  public async findDoctorDataByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<{
    doctorId: string;
    isGeneralist: boolean;
    specializations: {
      id: string;
      name: string;
      rqe: string;
      isActive: boolean;
    }[];
  } | null> {
    const repo = manager ? manager.getRepository(Doctor) : this.repository;

    const doctor = await repo
      .createQueryBuilder('doctor')
      .innerJoin('doctor.user', 'user')
      .leftJoinAndSelect('doctor.specializations', 'specializations')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!doctor) return null;

    return {
      doctorId: doctor.id,
      isGeneralist: doctor.isGeneralist,
      specializations: doctor.specializations.map((s) => ({
        id: s.id,
        name: s.name,
        rqe: s.rqe,
        isActive: s.isActive,
      })),
    };
  }

  public async toggleSpecializationStatus(
    specializationId: string,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ?? this.repository.manager;

    await repo
      .createQueryBuilder()
      .update(DoctorSpecialization)
      .set({ isActive: () => 'NOT isActive' })
      .where('id = :specializationId', { specializationId })
      .execute();
  }
}
