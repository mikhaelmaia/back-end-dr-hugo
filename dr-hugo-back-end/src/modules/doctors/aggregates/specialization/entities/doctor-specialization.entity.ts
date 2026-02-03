import { DoctorSpecializationType } from "src/core/vo/consts/enums";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Doctor } from "../../../entities/doctor.entity";
import { BaseEntity } from "src/core/base/base.entity";

@Entity({ name: 'dv_doctor_specialization' })
export class DoctorSpecialization extends BaseEntity {

    @ManyToOne(() => Doctor, doctor => doctor.specializations)
    @JoinColumn({ name: 'doctor_id', referencedColumnName: 'id' })
    public doctor: Doctor;

    @Column({
        name: 'name',
        type: 'enum',
        enum: DoctorSpecializationType,
        nullable: false,
        update: false,
    })
    public name: DoctorSpecializationType;

    @Column({ name: 'rqe', length: 20, nullable: false, unique: true })
    public rqe: string;

}