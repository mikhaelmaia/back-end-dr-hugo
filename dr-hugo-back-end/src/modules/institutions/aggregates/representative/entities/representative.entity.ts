import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from "src/core/base/base.entity";
import { BrazilianState } from "src/core/vo/consts/enums";
import { InstitutionCompany } from '../../company/entities/company.entity';

@Entity({ name: 'dv_institution_company_representative' })
export class InstitutionCompanyRepresentative extends BaseEntity {

    @OneToOne(() => InstitutionCompany, company => company.representative)
    public company: InstitutionCompany;

    @Column({ name: 'name', type: 'text', nullable: false })
    public name: string;

    @Column({ name: 'tax_id', type: 'text', nullable: false })
    public taxId: string;

    @Column({ name: 'crm', length: 20, nullable: false })
    public crm: string;

    @Column({ name: 'state', type: 'enum', enum: BrazilianState, nullable: false })
    public state: BrazilianState;

}