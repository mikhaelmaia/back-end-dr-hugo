import { BaseEntity } from 'src/core/base/base.entity';
import { Doctor } from 'src/modules/doctors/entities/doctor.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'dv_patient_doctor_grant' })
export class PatientDoctorGrant extends BaseEntity {
  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  public patient: Patient;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id', referencedColumnName: 'id' })
  public doctor: Doctor;

  @Column({ name: 'documents_ids', type: 'text', array: true, nullable: true })
  public documentsIds?: string[];

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  public revokedAt?: Date;

  @Column({ name: 'liked_by_patient', type: 'boolean', default: false })
  public likedByPatient: boolean;

  @Column({ name: 'liked_by_doctor', type: 'boolean', default: false })
  public likedByDoctor: boolean;

  @Column({ name: 'persistent', type: 'boolean', default: false })
  public persistent: boolean;

  @Column({
    name: 'allow_access_to_all_documents',
    type: 'boolean',
    default: false,
  })
  public allowAccessToAllDocuments: boolean;

  @Column({
    name: 'allow_access_to_all_documents_at',
    type: 'timestamp',
    nullable: true,
  })
  public allowAccessToAllDocumentsAt?: Date;
}
