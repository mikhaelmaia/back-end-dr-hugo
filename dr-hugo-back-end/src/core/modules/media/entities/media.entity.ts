import { BaseEntity } from '../../../base/base.entity';
import { Column, Entity, Index } from 'typeorm';
import { MediaType } from '../../../vo/consts/enums';

@Entity({ name: 'dv_media' })
export class Media extends BaseEntity {
  @Column({ name: 'filename', length: 255, nullable: false })
  public filename: string;

  @Column({ name: 'type', type: 'enum', enum: MediaType, nullable: false })
  public type: MediaType;

  @Column({ name: 'size', type: 'int', nullable: false })
  public size: number;

  @Column({ name: 'bucket', length: 100, nullable: false })
  public bucket: string;

  @Column({ name: 'object_name', length: 500, nullable: false })
  public objectName: string;

  @Index()
  @Column({ name: 'owner_user_id', type: 'uuid', nullable: false })
  public ownerUserId: string;
}
