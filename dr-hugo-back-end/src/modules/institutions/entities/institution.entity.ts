import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/core/base/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Address } from 'src/core/modules/address/entities/address.entity';
import { InstitutionCompany } from '../aggregates/company/entities/company.entity';
import { MedicalInstitutionType } from 'src/core/vo/consts/enums';

@Entity({ name: 'dv_institution' })
export class Institution extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  public user: User;

  @OneToOne(() => Address)
  @JoinColumn({ name: 'address_id', referencedColumnName: 'id' })
  public address: Address;

  @OneToOne(() => InstitutionCompany, company => company.institution)
  public company: InstitutionCompany;

  @Column({ name: 'cnes', length: 7, nullable: true })
  public cnes: string;

  @Column({ name: 'medical_institution_type', type: 'enum', enum: MedicalInstitutionType, nullable: false })
  public medicalInstitutionType: MedicalInstitutionType;

  @Column({ name: 'other_medical_institution_type', length: 255, nullable: true })
  public otherMedicalInstitutionType: string;
}