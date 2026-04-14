import { BaseEntity } from 'src/core/base/base.entity';
import { PatientDocumentType } from 'src/core/vo/consts/enums';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PatientDocumentMedia } from './patient-document-media.entity';

@Entity('dv_patient_document')
export class PatientDocument extends BaseEntity {
  @Column({
    type: 'enum',
    enum: PatientDocumentType,
    nullable: false,
  })
  public type: PatientDocumentType;

  @Column({ length: 255, nullable: false })
  public description: string;

  @Column({ name: 'exam_date', type: 'date', nullable: false, utc: true })
  public examDate: Date;

  @Column({ name: 'exam_month', type: 'varchar', length: 7, nullable: false })
  public examMonth: string;

  @Column({ name: 'requester_name', length: 255, nullable: true })
  public requesterName?: string;

  @Column({ name: 'exam_location', length: 255, nullable: true })
  public examLocation?: string;

  @Column({ type: 'text', nullable: true })
  public observations?: string;

  @Column({ name: 'tuss_code', nullable: true })
  public tussCode?: string;

  @Column({
    name: 'tuss_category',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  public tussCategory?: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  public patient: Patient;

  @OneToMany(
    () => PatientDocumentMedia,
    (documentMedia) => documentMedia.patientDocument,
    { cascade: true },
  )
  public medias: PatientDocumentMedia[];
}
