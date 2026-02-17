import { BaseEntity } from 'src/core/base/base.entity';
import { Media } from 'src/core/modules/media/entities/media.entity';
import { PatientDocumentType } from 'src/core/vo/consts/enums';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity('dv_patient_document')
export class PatientDocument extends BaseEntity {
  @Column()
  public description: string;

  @Column({
    type: 'enum',
    enum: PatientDocumentType,
  })
  public type: PatientDocumentType;

  @Column({ type: 'date' })
  public examDate: Date;

  @Column({ type: 'date' })
  public examMonth: Date;

  @Column({ nullable: true })
  public requesterName?: string;

  @Column({ nullable: true })
  public examLocation?: string;

  @Column({ type: 'text', nullable: true })
  public observations?: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  public patient: Patient;

  @OneToOne(() => Media)
  @JoinColumn({ name: 'media_id', referencedColumnName: 'id' })
  public media: Media;

  @BeforeInsert()
  @BeforeUpdate()
  private syncExamMonth(): void {
    if (!this.examDate) return;

    this.examMonth = new Date(
      this.examDate.getFullYear(),
      this.examDate.getMonth(),
      1,
    );
  }
}
