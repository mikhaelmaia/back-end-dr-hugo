import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/base.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'dh_patient' })
export class Patient extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  @Column({ name: 'birth_date', type: 'date', nullable: false })
  public birthDate: Date;
}
