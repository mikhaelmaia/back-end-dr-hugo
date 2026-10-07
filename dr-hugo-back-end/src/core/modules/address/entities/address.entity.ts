import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../base/base.entity';
import { BrazilianState } from 'src/core/vo/consts/enums';

@Entity({ name: 'dv_address' })
export class Address extends BaseEntity {
  @Column({ name: 'street', type: 'text', nullable: false })
  public street: string;

  @Column({ name: 'number', type: 'text', nullable: false })
  public number: string;

  @Column({ name: 'complement', type: 'text', nullable: true })
  public complement: string;

  @Column({ name: 'neighborhood', type: 'text', nullable: false })
  public neighborhood: string;

  @Column({ name: 'city', type: 'text', nullable: false })
  public city: string;

  @Column({
    name: 'state',
    type: 'enum',
    enum: BrazilianState,
    nullable: false,
  })
  public state: BrazilianState;

  @Column({ name: 'zip_code', type: 'text', nullable: false })
  public zipCode: string;

  @Column({ name: 'country', length: 100, default: 'Brasil', nullable: false })
  public country: string;
}
