import { BrazilianState, DoctorRegistrationType, DoctorSituation } from "src/core/vo/consts/enums";
import { Column, Entity, OneToOne } from "typeorm";
import { Doctor } from "../../../entities/doctor.entity";
import { BaseEntity } from "src/core/base/base.entity";

@Entity({ name: 'dv_doctor_registration' })
export class DoctorRegistration extends BaseEntity {

    @OneToOne(() => Doctor, doctor => doctor.registration)
    public doctor: Doctor;

    @Column({ name: 'crm', length: 20, nullable: false, unique: true })
    public crm: string;

    @Column({ name: 'situation', type: 'enum', enum: DoctorSituation, nullable: false })
    public situation: DoctorSituation;

    @Column({ name: 'type', type: 'enum', enum: DoctorRegistrationType, nullable: false })
    public type: DoctorRegistrationType;

    @Column({ name: 'last_update', type: 'timestamp', nullable: false })
    public lastUpdate: Date;

    @Column({ name: 'state', type: 'enum', enum: BrazilianState, nullable: false })
    public state: BrazilianState;

}