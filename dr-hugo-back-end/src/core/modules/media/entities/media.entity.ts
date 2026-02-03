import { BaseEntity } from '../../../base/base.entity';
import { Column, Entity } from 'typeorm';
import { MediaType } from '../../../vo/consts/enums';
import { extractFileTypeFromOriginalName } from '../../../utils/utils';

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

  public static from(
    file: Express.Multer.File,
    bucket: string,
    objectName: string,
  ): Media {
    const media = new Media();
    media.filename = Buffer.from(file.originalname, 'latin1').toString('utf8');
    media.type = Media.getMediaTypeFromFile(file);
    media.size = file.size;
    media.bucket = bucket;
    media.objectName = objectName;
    return media;
  }

  private static getMediaTypeFromFile(file: Express.Multer.File): MediaType {
    const fileExtension = extractFileTypeFromOriginalName(file.originalname);
    const normalizedExtension = fileExtension.toUpperCase();

    if (Object.values(MediaType).includes(normalizedExtension as MediaType)) {
      return normalizedExtension as MediaType;
    }

    const mimeTypeMap: { [key: string]: MediaType } = {
      'image/jpeg': MediaType.JPEG,
      'image/jpg': MediaType.JPG,
      'image/png': MediaType.PNG,
      'image/gif': MediaType.GIF,
      'application/pdf': MediaType.PDF,
      'application/msword': MediaType.DOC,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        MediaType.DOCX,
      'application/vnd.ms-excel': MediaType.XLS,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        MediaType.XLSX,
      'application/vnd.ms-powerpoint': MediaType.PPT,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        MediaType.PPTX,
      'text/plain': MediaType.TXT,
      'text/html': MediaType.HTML,
    };

    return mimeTypeMap[file.mimetype] || MediaType.TXT;
  }
}
