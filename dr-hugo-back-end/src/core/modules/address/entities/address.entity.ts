import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';
import { BrazilianState } from 'src/core/vo/consts/enums';

@Entity({ name: 'dv_address' })
export class Address extends BaseEntity {
  @Column({ name: 'street', length: 255, nullable: false })
  public street: string;

  @Column({ name: 'number', length: 20, nullable: false })
  public number: string;

  @Column({ name: 'complement', length: 100, nullable: true })
  public complement: string;

  @Column({ name: 'neighborhood', length: 100, nullable: false })
  public neighborhood: string;

  @Column({ name: 'city', length: 100, nullable: false })
  public city: string;

  @Column({ name: 'state', type: 'enum', enum: BrazilianState, nullable: false })
  public state: BrazilianState;

  @Column({ name: 'zip_code', length: 8, nullable: false })
  public zipCode: string;

  @Column({ name: 'country', length: 100, default: 'Brasil', nullable: false })
  public country: string;
}