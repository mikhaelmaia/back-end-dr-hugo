import { BaseEntity } from 'src/core/base/base.entity';
import { InstitutionalUserRole } from 'src/core/vo/consts/enums';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'dv_patient_access_code' })
export class PatientAccessCode extends BaseEntity {
  @Column({ name: 'code', length: 64, nullable: false, unique: true })
  public code: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  public patient: Patient;

  @Column({
    name: 'role',
    type: 'enum',
    enum: InstitutionalUserRole,
    nullable: false,
  })
  public role: InstitutionalUserRole;

  @Column({ name: 'documents_ids', type: 'text', array: true, nullable: true })
  public documentsIds?: string[];

  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  public expiresAt: Date;

  @Column({ name: 'used', type: 'boolean', default: false })
  public used: boolean;

  @Column({ name: 'persistent', type: 'boolean', default: false })
  public persistent: boolean;

  @Column({
    name: 'allow_access_to_all_documents',
    type: 'boolean',
    default: false,
  })
  public allowAccessToAllDocuments: boolean;

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public getTotalTimeMs(): number {
    return this.expiresAt.getTime() - this.createdAt.getTime();
  }

  public getElapsedTimeMs(): number {
    return Date.now() - this.createdAt.getTime();
  }
}
