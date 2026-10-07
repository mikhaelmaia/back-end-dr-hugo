import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/base.entity';
import { Institution } from '../../../entities/institution.entity';

@Entity({ name: 'dv_health_institution' })
export class HealthInstitution extends BaseEntity {
  @OneToOne(() => Institution, (institution) => institution.healthInstitution)
  @JoinColumn({ name: 'institution_id', referencedColumnName: 'id' })
  public institution: Institution;

  @Column({ name: 'organization_nature', length: 255, nullable: true })
  public organizationNature: string;

  @Column({ name: 'legal_nature_description', length: 50, nullable: true })
  public legalNatureDescription: string;

  @Column({ name: 'disabling_reason_code', length: 50, nullable: true })
  public disablingReasonCode: string;

  @Column({ name: 'has_surgical_center', type: 'boolean', nullable: true })
  public hasSurgicalCenter: boolean;

  @Column({ name: 'has_obstetric_center', type: 'boolean', nullable: true })
  public hasObstetricCenter: boolean;

  @Column({ name: 'has_neonatal_center', type: 'boolean', nullable: true })
  public hasNeonatalCenter: boolean;

  @Column({ name: 'has_hospital_care', type: 'boolean', nullable: true })
  public hasHospitalCare: boolean;

  @Column({ name: 'has_support_service', type: 'boolean', nullable: true })
  public hasSupportService: boolean;

  @Column({ name: 'has_outpatient_care', type: 'boolean', nullable: true })
  public hasOutpatientCare: boolean;

  @Column({ name: 'teaching_activity_code', length: 10, nullable: true })
  public teachingActivityCode: string;

  @Column({ name: 'unit_organization_nature_code', length: 50, nullable: true })
  public unitOrganizationNatureCode: string;

  @Column({ name: 'unit_hierarchy_level_code', length: 50, nullable: true })
  public unitHierarchyLevelCode: string;

  @Column({
    name: 'unit_administrative_sphere_code',
    length: 10,
    nullable: true,
  })
  public unitAdministrativeSphereCode: string;

  @Column({ name: 'last_update_date', type: 'date', nullable: true, utc: true })
  public lastUpdateDate: Date;
}
