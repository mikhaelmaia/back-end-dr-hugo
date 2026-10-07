import { BaseEntity } from 'src/core/base/base.entity';
import { Institution } from 'src/modules/institutions/entities/institution.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'dv_patient_institution_grant' })
export class PatientInstitutionGrant extends BaseEntity {
  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  public patient: Patient;

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id', referencedColumnName: 'id' })
  public institution: Institution;

  @Column({ name: 'documents_ids', type: 'text', array: true, nullable: true })
  public documentsIds?: string[];

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  public revokedAt?: Date;

  @Column({ name: 'liked_by_patient', type: 'boolean', default: false })
  public likedByPatient: boolean;

  @Column({ name: 'liked_by_institution', type: 'boolean', default: false })
  public likedByInstitution: boolean;

  @Column({ name: 'persistent', type: 'boolean', default: false })
  public persistent: boolean;

  @Column({
    name: 'allow_access_to_all_documents',
    type: 'boolean',
    default: false,
  })
  public allowAccessToAllDocuments: boolean;
}
