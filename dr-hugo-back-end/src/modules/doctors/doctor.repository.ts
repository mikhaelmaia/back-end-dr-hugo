import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/core/base/base.repository';
import { Doctor } from './entities/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm';

@Injectable()
export class DoctorRepository extends BaseRepository<Doctor> {
  protected override alias = 'doctor';

  public constructor(
    @InjectRepository(Doctor)
    doctorRepository: Repository<Doctor>,
  ) {
    super(doctorRepository);
  }

  public override findById(id: string): Promise<Doctor> {
    return this.createBaseQuery()
      .where('doctor.id = :id', { id })
      .leftJoinAndSelect('doctor.user', 'user')
      .getOne();
  }

  public findDoctorIdByUserId(userId: string): Promise<string | null> {
    return this.createBaseQuery()
      .innerJoin('doctor.user', 'user')
      .select('doctor.id', 'doctorId')
      .where('user.id = :userId', { userId })
      .getRawOne<{ doctorId: string }>()
      .then((result) => result?.doctorId ?? null);
  }
}
