import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../base/base.entity';
import { CryptoTransformerFactory } from 'src/core/modules/crypto/crypto-transformer.factory';
import { CryptoBridge } from 'src/core/modules/crypto/crypto.bridge';

@Entity('dv_audit_fingerprint')
export class Fingerprint extends BaseEntity {
  @Column({
    name: 'fingerprint_hash',
    type: 'varchar',
    length: 64,
    unique: true,
    transformer: CryptoTransformerFactory.createEncrypted(CryptoBridge.get()),
  })
  public fingerprint: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  public ip: string;

  @Column({ name: 'user_agent', type: 'text' })
  public userAgent: string;

  @Column({ name: 'session_id', type: 'varchar', nullable: true })
  public sessionId: string | null;

  @Column({ name: 'version', type: 'varchar', length: 20, default: 'unknown' })
  public version: string;
}
