import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/base.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';

@Entity({ name: 'dv_patient_medical_record' })
export class PatientMedicalRecord extends BaseEntity {
  @OneToOne(() => Patient)
  @JoinColumn({ name: 'patient_id', referencedColumnName: 'id' })
  public patient: Patient;

  /* ---------- Allergies ---------- */
  @Column({ name: 'has_allergies', type: 'boolean', default: false })
  public hasAllergies: boolean;

  @Column({ name: 'allergies_description', type: 'text', nullable: true })
  public allergiesDescription?: string;

  /* ---------- Chronic diseases ---------- */
  @Column({ name: 'has_chronic_diseases', type: 'boolean', default: false })
  public hasChronicDiseases: boolean;

  @Column({
    name: 'chronic_diseases_description',
    type: 'text',
    nullable: true,
  })
  public chronicDiseasesDescription?: string;

  /* ---------- Surgeries ---------- */
  @Column({ name: 'has_surgeries', type: 'boolean', default: false })
  public hasSurgeries: boolean;

  @Column({ name: 'surgeries_description', type: 'text', nullable: true })
  public surgeriesDescription?: string;

  /* ---------- Medical treatment ---------- */
  @Column({ name: 'has_medical_treatment', type: 'boolean', default: false })
  public hasMedicalTreatment: boolean;

  @Column({
    name: 'medical_treatment_description',
    type: 'text',
    nullable: true,
  })
  public medicalTreatmentDescription?: string;

  /* ---------- Medications ---------- */
  @Column({ name: 'has_medications', type: 'boolean', default: false })
  public hasMedications: boolean;

  @Column({ name: 'medications_description', type: 'text', nullable: true })
  public medicationsDescription?: string;

  /* ---------- Insomnia ---------- */
  @Column({ name: 'has_insomnia', type: 'boolean', default: false })
  public hasInsomnia: boolean;

  @Column({ name: 'insomnia_description', type: 'text', nullable: true })
  public insomniaDescription?: string;

  /* ---------- Alcohol ---------- */
  @Column({ name: 'has_alcohol_use', type: 'boolean', default: false })
  public hasAlcoholUse: boolean;

  @Column({ name: 'alcohol_description', type: 'text', nullable: true })
  public alcoholDescription?: string;

  /* ---------- Physical activity ---------- */
  @Column({ name: 'has_physical_activity', type: 'boolean', default: false })
  public hasPhysicalActivity: boolean;

  @Column({
    name: 'physical_activity_description',
    type: 'text',
    nullable: true,
  })
  public physicalActivityDescription?: string;

  /* ---------- Blood pressure ---------- */
  @Column({
    name: 'blood_pressure',
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  public bloodPressure?: string;

  /* ---------- Smoking ---------- */
  @Column({ name: 'is_smoker', type: 'boolean', default: false })
  public isSmoker: boolean;

  @Column({ name: 'cigarettes_per_day', type: 'int', nullable: true })
  public cigarettesPerDay?: number;

  @Column({ name: 'years_smoking', type: 'int', nullable: true })
  public yearsSmoking?: number;

  /* ---------- Terms ---------- */
  @Column({ name: 'accepted_terms', type: 'jsonb', nullable: false })
  public acceptedTerms: string[];
}
