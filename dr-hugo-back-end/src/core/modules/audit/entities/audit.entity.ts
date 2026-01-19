import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';
import { AuditEventType } from '../../../vo/consts/enums';
import { Fingerprint } from '../fingerprint/entities/fingerprint.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'dh_audit' })
export class Audit extends BaseEntity {
  @Column({
    name: 'event_type',
    type: 'enum',
    enum: AuditEventType,
    nullable: false,
  })
  public eventType: AuditEventType;

  @Column({ name: 'entity_name', nullable: false })
  public entityName: string;

  @Column({ name: 'entity_id', nullable: false })
  public entityId: string;

  @Column({ name: 'data', type: 'jsonb', nullable: false })
  public data: any;

  @OneToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'author_id', referencedColumnName: 'id' })
  public author: User;

  @OneToOne(() => Fingerprint, { cascade: true })
  @JoinColumn({ name: 'fingerprint_id', referencedColumnName: 'id' })
  public fingerprint: Fingerprint;
}
