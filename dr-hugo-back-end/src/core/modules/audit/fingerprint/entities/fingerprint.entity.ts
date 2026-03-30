import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../base/base.entity';

@Entity('dv_audit_fingerprint')
export class Fingerprint extends BaseEntity {
  @Column({
    name: 'fingerprint_hash',
    type: 'text',
    unique: true,
  })
  public fingerprint: string;

  @Column({ name: 'ip_address', type: 'text' })
  public ip: string;

  @Column({ name: 'user_agent', type: 'text' })
  public userAgent: string;

  @Column({ name: 'session_id', type: 'varchar', nullable: true })
  public sessionId: string | null;

  @Column({ name: 'version', type: 'varchar', length: 20, default: 'unknown' })
  public version: string;
}
