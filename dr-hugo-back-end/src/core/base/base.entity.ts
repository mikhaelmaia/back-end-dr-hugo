import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  public isActive: boolean;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  public updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  public deletedAt: Date | null;

  public clearId(): void {
    this.id = undefined;
  }
}
