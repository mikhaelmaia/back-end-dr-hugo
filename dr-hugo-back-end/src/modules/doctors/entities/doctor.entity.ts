import { Column, Entity, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/core/base/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DoctorRegistration } from '../aggregates/registration/entities/doctor-registration.entity';
import { DoctorSpecialization } from '../aggregates/specialization/entities/doctor-specialization.entity';
import { BrazilianState } from 'src/core/vo/consts/enums';

@Entity({ name: 'dv_doctor' })
export class Doctor extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  @OneToOne(() => DoctorRegistration, registration => registration.doctor)
  @JoinColumn({ name: 'registration_id', referencedColumnName: 'id' })
  public registration: DoctorRegistration;

  @OneToMany(() => DoctorSpecialization, specialization => specialization.doctor)
  public specializations: DoctorSpecialization[];

  @Column({ name: 'is_generalist', type: 'boolean', nullable: false, default: false })
  public isGeneralist: boolean;

  @Column({ name: 'state', type: 'enum', enum: BrazilianState, nullable: false })
  public state: BrazilianState;

  @Column({ name: 'birth_date', type: 'date', nullable: false })
  public birthDate: Date;
}