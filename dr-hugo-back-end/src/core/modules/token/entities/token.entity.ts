import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/core/base/base.entity';
import { TokenType } from 'src/core/vo/consts/enums';

@Entity({ name: 'dh_token' })
export class Token extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 4,
    nullable: false,
    update: false,
    unique: true,
  })
  public token: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    update: false,
    unique: true,
  })
  public hash: string;

  @Column({ type: 'enum', enum: TokenType, nullable: false, update: false })
  public type: TokenType;

  @Column({ type: 'varchar', length: 255, nullable: false, update: false })
  public identification: string;
}
