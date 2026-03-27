import { InstitutionalUserRole } from 'src/core/vo/consts/enums';

export interface AccessCodeUsedPayload {
  grantId: string;
  granteeRole: InstitutionalUserRole;
  granteeName: string;
}
