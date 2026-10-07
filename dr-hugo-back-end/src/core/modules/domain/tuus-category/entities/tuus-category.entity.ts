import { BaseEntity } from 'src/core/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('dv_tuus_category')
export class TuusCategory extends BaseEntity {
  @Column({ name: 'tuss_code', length: 20, nullable: false, unique: true })
  public tussCode: string;

  @Column({ name: 'name', nullable: false })
  public name: string;

  @Column({
    name: 'category',
    type: 'varchar',
    length: 30,
    nullable: false,
  })
  public category:
    | 'LABORATORIAL'
    | 'IMAGEM'
    | 'IMAGEM/LAUDO'
    | 'DIAGNÓSTICO ESPECIALIZADO'
    | 'EXAME FUNCIONAL';
}
