import { BaseEntity } from 'src/core/base/base.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'dv_patient_access_code' })
export class PatientAccessCode extends BaseEntity {
  @Column({ name: 'code', length: 64, nullable: false, unique: true })
  public code: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  public patient: Patient;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  public expiresAt: Date;

  @Column({ name: 'used', type: 'boolean', default: false })
  public used: boolean;

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
