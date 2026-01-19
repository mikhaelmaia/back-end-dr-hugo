import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Media } from 'src/core/modules/media/entities/media.entity';

@Entity({ name: 'dh_patient' })
export class Patient extends BaseEntity {
  @OneToOne(() => User, { cascade: true, eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  @Column({ name: 'birth_date', type: 'date', nullable: false })
  public birthDate: Date;

  @Column({ name: 'emergency_phone', length: 15, nullable: true })
  public emergencyPhone: string;

  @Column({ name: 'accepted_terms', type: 'jsonb', nullable: false })
  public acceptedTerms: string[];

  @OneToOne(() => Media, { nullable: true })
  @JoinColumn({ name: 'profile_picture_id', referencedColumnName: 'id' })
  public profilePicture: Media;
}
