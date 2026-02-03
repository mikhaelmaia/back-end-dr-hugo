import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/core/base/base.repository";
import { Doctor } from "./entities/doctor.entity";
import { InjectRepository } from "@nestjs/typeorm/dist/common/typeorm.decorators";
import { Repository } from "typeorm";

@Injectable()
export class DoctorRepository extends BaseRepository<Doctor> {

    public constructor(
        @InjectRepository(Doctor)
        doctorRepository: Repository<Doctor>,
    ) {
        super(doctorRepository);
    }

}