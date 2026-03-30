import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserRole } from '../../../core/vo/consts/enums';
import { BaseEntity } from 'src/core/base/base.entity';
import { Media } from 'src/core/modules/media/entities/media.entity';

@Entity({ name: 'dv_user' })
export class User extends BaseEntity {
  @Column({ name: 'name', length: 100, nullable: false })
  public name: string;

  @Column({ name: 'email', type: 'text', nullable: false })
  public email: string;

  @Column({ name: 'email_hash', type: 'varchar', length: 64, nullable: false })
  public emailHash: string;

  @Column({ name: 'password', length: 255, nullable: false })
  public password: string;

  @Column({ name: 'tax_id', type: 'text', nullable: false })
  public taxId: string;

  @Column({ name: 'tax_id_hash', type: 'varchar', length: 64, nullable: false })
  public taxIdHash: string;

  @Column({ name: 'phone', type: 'text', nullable: false })
  public phone: string;

  @Column({ name: 'phone_hash', type: 'varchar', length: 64, nullable: false })
  public phoneHash: string;

  @Column({ name: 'country_code', length: 3, nullable: false })
  public countryCode: string;

  @Column({ name: 'country_idd', length: 5, nullable: false })
  public countryIdd: string;

  @Column({ name: 'is_valid', type: 'boolean', default: false })
  public isValid: boolean;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
    nullable: false,
    update: false,
  })
  public role: UserRole = UserRole.PATIENT;

  @Column({ name: 'accepted_terms', type: 'jsonb', nullable: false })
  public acceptedTerms: string[];

  @OneToOne(() => Media, { nullable: true })
  @JoinColumn({ name: 'profile_picture_id', referencedColumnName: 'id' })
  public profilePicture: Media;

  public inactivate(): void {
    this.isActive = false;
  }

  public activate(): void {
    this.isActive = true;
  }

  public validate(): void {
    this.isValid = true;
  }

  public invalidate(): void {
    this.isValid = false;
  }

  public get isInactive(): boolean {
    return !this.isActive;
  }

  public updatePassword(password: string): void {
    this.password = password;
  }
}
