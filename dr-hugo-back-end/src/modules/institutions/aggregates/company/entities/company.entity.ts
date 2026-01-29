import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from "src/core/base/base.entity";
import { CompanyType } from "src/core/vo/consts/enums";
import { Institution } from 'src/modules/institutions/entities/institution.entity';
import { InstitutionCompanyRepresentative } from '../../representative/entities/representative.entity';

@Entity({ name: 'dv_institution_company' })
export class InstitutionCompany extends BaseEntity {

    @OneToOne(() => Institution, institution => institution.company)
    @JoinColumn({ name: 'institution_id', referencedColumnName: 'id' })
    public institution: Institution;

    @OneToOne(() => InstitutionCompanyRepresentative, representative => representative.company)
    @JoinColumn({ name: 'representative_id', referencedColumnName: 'id' })
    public representative: InstitutionCompanyRepresentative;

    @Column({ name: 'type', type: 'enum', enum: CompanyType, nullable: false })
    public type: CompanyType;

    @Column({ name: 'size', length: 255, nullable: false })
    public size: string;

    @Column({ name: 'name', length: 255, nullable: false })
    public name: string;

    @Column({ name: 'fantasy_name', length: 255, nullable: true })
    public fantasyName: string;

    @Column({ name: 'main_activities', type: 'json', nullable: true })
    public mainActivities: string[];

    @Column({ name: 'secondary_activities', type: 'json', nullable: true })
    public secondaryActivities: string[];

    @Column({ name: 'legal_nature', length: 255, nullable: true })
    public legalNature: string;

    @Column({ name: 'legal_representative_name', length: 255, nullable: true })
    public legalRepresentativeName: string;

    @Column({ name: 'legal_representative_qualification', length: 255, nullable: true })
    public legalRepresentativeQualification: string;

}