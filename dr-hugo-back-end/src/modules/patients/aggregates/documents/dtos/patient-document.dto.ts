import { PatientDocumentType } from 'src/core/vo/consts/enums';

export class PatientDocumentDto {
  public id: string;
  public type: PatientDocumentType;
  public description: string;
  public examDate: Date;
  public requesterName?: string;
  public examLocation?: string;
  public observations?: string;
  public mediaUrl: string;
  public createdAt: Date;
}
