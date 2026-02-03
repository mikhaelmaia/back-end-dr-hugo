import { Injectable } from "@nestjs/common";
import { BaseRepository } from "src/core/base/base.repository";
import { Institution } from "./entities/institution.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class InstitutionRepository extends BaseRepository<Institution> {

    public constructor(
        @InjectRepository(Institution)
        repository: Repository<Institution>,
    ) {
        super(repository);
    }

}