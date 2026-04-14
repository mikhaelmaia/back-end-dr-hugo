import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Gender } from 'src/core/vo/consts/enums';

@Entity({ name: 'dv_patient' })
export class Patient extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  @Column({ name: 'birth_date', type: 'date', nullable: false, utc: true })
  public birthDate: Date;

  @Column({ name: 'gender', type: 'varchar', length: 10, nullable: false })
  public gender: Gender;
}
