import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TuusCategoryService } from './tuus-category.service';
import { TuusCategoryRepository } from './tuus-category.repository';
import { TuusCategoryMapper } from './tuus-category.mapper';
import { TuusCategory } from './entities/tuus-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TuusCategory])],
  providers: [TuusCategoryService, TuusCategoryRepository, TuusCategoryMapper],
  exports: [TuusCategoryService],
})
export class TuusCategoryModule {}
