import { Media } from 'src/core/modules/media/entities/media.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { PatientDocument } from './patient-document.entity';
import { BaseEntity } from 'src/core/base/base.entity';

@Entity('dv_patient_document_media')
export class PatientDocumentMedia extends BaseEntity {
  @ManyToOne(() => PatientDocument, (document) => document.medias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_document_id' })
  public patientDocument: PatientDocument;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'media_id' })
  public media: Media;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  public isPrimary: boolean = false;

  @Column({ name: 'order', type: 'int', default: 0 })
  public order: number;
}
