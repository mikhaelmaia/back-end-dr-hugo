import { Column, Entity } from 'typeorm';
import { UserRole } from '../../../core/vo/consts/enums';
import { BaseEntity } from 'src/core/base/base.entity';

@Entity({ name: 'dh_user' })
export class User extends BaseEntity {
  @Column({ name: 'name', length: 100, nullable: false })
  public name: string;

  @Column({ name: 'email', length: 50, nullable: false, unique: true })
  public email: string;

  @Column({ name: 'password', length: 255, nullable: false })
  public password: string;

  @Column({ name: 'taxId', length: 14, nullable: false })
  public taxId: string;

  @Column({ name: 'phone', length: 15, nullable: false })
  public phone: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.PACIENT,
    nullable: false,
    update: false,
  })
  public role: UserRole = UserRole.PACIENT;

  public updatePassword(password: string): void {
    this.password = password;
  }
}
