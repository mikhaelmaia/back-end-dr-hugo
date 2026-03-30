import { BaseEntity } from 'src/core/base/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { UserChangeRequestStatus } from 'src/core/vo/consts/enums';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('dv_user_change_request')
export class UserChangeRequest extends BaseEntity {
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @Column({
    type: 'enum',
    enum: ['EMAIL', 'PHONE'],
    nullable: false,
  })
  public type: 'EMAIL' | 'PHONE';

  @Column({ name: 'new_value', type: 'text', nullable: false })
  public newValue: string;

  @Column({ name: 'new_country_code', length: 3, nullable: true })
  public newCountryCode?: string;

  @Column({ name: 'new_country_idd', length: 5, nullable: true })
  public newCountryIdd?: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  public expiresAt: Date;

  @Column({
    type: 'enum',
    enum: UserChangeRequestStatus,
    default: UserChangeRequestStatus.PENDING,
    nullable: false,
  })
  public status: UserChangeRequestStatus;
}
