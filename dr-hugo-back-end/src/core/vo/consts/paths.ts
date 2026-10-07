export abstract class BasePaths {
  public static readonly CREATE = '';
  public static readonly FIND_BY_ID = '/:id';
  public static readonly UPDATE = '/:id';
  public static readonly DELETE = '/:id';
  public static readonly FIND_ALL = '';
}

export class AuthPaths extends BasePaths {
  public static readonly BASE = '/auth';
  public static readonly LOGIN = '/login';
  public static readonly REFRESH_TOKEN = '/refresh-token';
  public static readonly PASSWORD_RECOVERY = '/password-recovery';
  public static readonly PASSWORD_RESET = '/password-reset';
  public static readonly RESEND_EMAIL_CONFIRMATION =
    '/resend-email-confirmation';
  public static readonly CONFIRM_EMAIL = '/confirm-email';

  public static readonly LOGIN_FULL = `${this.BASE}${this.LOGIN}`;
  public static readonly REFRESH_TOKEN_FULL = `${this.BASE}${this.REFRESH_TOKEN}`;
  public static readonly PASSWORD_RECOVERY_FULL = `${this.BASE}${this.PASSWORD_RECOVERY}`;
  public static readonly PASSWORD_RESET_FULL = `${this.BASE}${this.PASSWORD_RESET}`;
  public static readonly RESEND_EMAIL_CONFIRMATION_FULL = `${this.BASE}${this.RESEND_EMAIL_CONFIRMATION}`;
  public static readonly CONFIRM_EMAIL_FULL = `${this.BASE}${this.CONFIRM_EMAIL}`;
}

export class UserPaths extends BasePaths {
  public static readonly BASE = '/users';
  public static readonly CURRENT = '/current';
  public static readonly UPDATE_PROFILE_PICTURE = '/profile-picture';
  public static readonly FIND_PROFILE_PICTURE = '/profile-picture';

  public static readonly CURRENT_FULL = `${this.BASE}${this.CURRENT}`;
  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
}

export class PatientsPaths extends BasePaths {
  public static readonly BASE = '/patients';
  public static readonly BY_USER = '/by-user/:userId';
  public static readonly CURRENT = '/current';

  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
  public static readonly FIND_BY_ID_FULL = `${this.BASE}${this.FIND_BY_ID}`;
  public static readonly BY_USER_FULL = `${this.BASE}${this.BY_USER}`;
  public static readonly CURRENT_FULL = `${this.BASE}${this.CURRENT}`;
  public static readonly UPDATE_FULL = `${this.BASE}${this.UPDATE}`;
  public static readonly DELETE_FULL = `${this.BASE}${this.DELETE}`;
  public static readonly FIND_ALL_FULL = `${this.BASE}${this.FIND_ALL}`;
}

export class AuditPaths extends BasePaths {
  public static readonly BASE = '/audit';

  public static readonly FIND_ALL_FULL = `${this.BASE}${this.FIND_ALL}`;
  public static readonly FIND_BY_ID_FULL = `${this.BASE}${this.FIND_BY_ID}`;
}

export class MediaPaths extends BasePaths {
  public static readonly BASE = '/media';
  public static readonly SAVE_TEMP = '/temp';
  public static readonly SAVE_TEMP_MULTIPLE = '/temp/multiple';

  public static readonly SAVE_TEMP_FULL = `${this.BASE}${this.SAVE_TEMP}`;
  public static readonly SAVE_TEMP_MULTIPLE_FULL = `${this.BASE}${this.SAVE_TEMP_MULTIPLE}`;
}

export class TokenPaths extends BasePaths {
  public static readonly BASE = '/token';
  public static readonly VALIDATE = '/validate';

  public static readonly VALIDATE_FULL = `${this.BASE}${this.VALIDATE}`;
}

export class TermsPaths extends BasePaths {
  public static readonly BASE = '/terms';
  public static readonly ALL = '/all';

  public static readonly FIND_BY_TYPE = '/:type';
  public static readonly ALL_FULL = `${this.BASE}${this.ALL}`;
  public static readonly FIND_BY_TYPE_FULL = `${this.BASE}${this.FIND_BY_TYPE}`;
}

export class CountriesPaths extends BasePaths {
  public static readonly BASE = '/countries';
  public static readonly ALL = '/all';
  public static readonly PAGINATED = '';
  public static readonly BY_ACRONYM = '/:acronym';

  public static readonly ALL_FULL = `${this.BASE}${this.ALL}`;
  public static readonly PAGINATED_FULL = `${this.BASE}${this.PAGINATED}`;
  public static readonly BY_ACRONYM_FULL = `${this.BASE}${this.BY_ACRONYM}`;
}

export class DomainPaths {
  public static readonly BASE = '/domain';
}

export class HealthPaths {
  public static readonly BASE = '/health';
}

export class EnumPaths {
  public static readonly BASE = '/enums';
  public static readonly BY_TYPE = '/:type';

  public static readonly BY_TYPE_FULL = `${this.BASE}${this.BY_TYPE}`;
}

export class AddressPaths extends BasePaths {
  public static readonly BASE = '/address';
  public static readonly BY_ZIP_CODE = '/zip-code/:zipCode';

  public static readonly BY_ZIP_CODE_FULL = `${this.BASE}${this.BY_ZIP_CODE}`;
}

export class InstitutionPaths extends BasePaths {
  public static readonly BASE = '/institutions';
  public static readonly LOOKUP = '/lookup';
  public static readonly CNES_LOOKUP = '/lookup-cnes';
  public static readonly BY_USER = '/by-user/:userId';
  public static readonly CURRENT = '/current';
  public static readonly UPDATE_ADDRESS = '/current/address';
  public static readonly REFRESH_DATA = '/current/refresh-data';
  public static readonly CHECK_CNES = '/check-cnes';

  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
  public static readonly FIND_BY_ID_FULL = `${this.BASE}${this.FIND_BY_ID}`;
  public static readonly BY_USER_FULL = `${this.BASE}${this.BY_USER}`;
  public static readonly CURRENT_FULL = `${this.BASE}${this.CURRENT}`;
  public static readonly UPDATE_FULL = `${this.BASE}${this.UPDATE}`;
  public static readonly DELETE_FULL = `${this.BASE}${this.DELETE}`;
  public static readonly UPDATE_ADDRESS_FULL = `${this.BASE}${this.UPDATE_ADDRESS}`;
  public static readonly REFRESH_DATA_FULL = `${this.BASE}${this.REFRESH_DATA}`;
  public static readonly FIND_ALL_FULL = `${this.BASE}${this.FIND_ALL}`;
  public static readonly CHECK_CNES_FULL = `${this.BASE}${this.CHECK_CNES}`;
  public static readonly LOOKUP_FULL = `${this.BASE}${this.LOOKUP}`;
  public static readonly CNES_LOOKUP_FULL = `${this.BASE}${this.CNES_LOOKUP}`;
}

export class DoctorPaths extends BasePaths {
  public static readonly BASE = '/doctors';
  public static readonly LOOKUP = '/lookup';
  public static readonly CURRENT = '/current';
  public static readonly REFRESH_DATA = '/current/refresh-data';
  public static readonly TOGGLE_SPECIALTY = '/current/specialties/:id/toggle';

  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
  public static readonly LOOKUP_FULL = `${this.BASE}${this.LOOKUP}`;
  public static readonly CURRENT_FULL = `${this.BASE}${this.CURRENT}`;
  public static readonly REFRESH_DATA_FULL = `${this.BASE}${this.REFRESH_DATA}`;
  public static readonly TOGGLE_SPECIALTY_FULL = `${this.BASE}${this.TOGGLE_SPECIALTY}`;
}

export class MedicalRecordPaths extends BasePaths {
  public static readonly BASE = '/patient-medical-records';
}

export class ResolutionKeyPaths extends BasePaths {
  public static readonly BASE = '/resolution-keys';
  public static readonly RESOLVE = '/resolve';

  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
  public static readonly RESOLVE_FULL = `${this.BASE}${this.RESOLVE}`;
}

export class UserChangeRequestPaths extends BasePaths {
  public static readonly BASE = '/user-change-requests';
  public static readonly REQUEST = '/request';
  public static readonly CONFIRM = '/confirm';

  public static readonly REQUEST_FULL = `${this.BASE}${this.REQUEST}`;
  public static readonly CONFIRM_FULL = `${this.BASE}${this.CONFIRM}`;
}

export class PatientAccessCodePaths extends BasePaths {
  public static readonly BASE = '/patients-access-code';
}

export class PatientDocumentPaths {
  public static readonly ROOT = '/patient-documents';
  public static readonly BY_ID = '/:id';
  public static readonly MONTHLY = '/monthly';
  public static readonly FILTERS = '/available-filters';
  public static readonly STREAM = '/:id/media/:mediaId/stream';
  public static readonly DOWNLOAD = '/:id/download';
  public static readonly RENAME = '/:id/rename';
}

export class MedicalDocumentPaths extends BasePaths {
  public static readonly BASE = '/medical-documents';
  public static readonly DESCRIPTIONS_BY_TYPE = '/descriptions/:type';
  public static readonly DESCRIPTIONS_BY_TYPE_FULL = `${this.BASE}${this.DESCRIPTIONS_BY_TYPE}`;
}

export class PatientPermissionGrantPaths extends BasePaths {
  public static readonly BASE = '/patient-permission-grants';
  public static readonly REVOKE = '/revoke';
  public static readonly LIKE = '/:id/like';
  public static readonly PATIENTS = '/patients';
  public static readonly PATIENT_BY_GRANT_ID = '/patients/:grantId';
  public static readonly PATIENT_PROFILE_PICTURE =
    '/patients/:grantId/profile-picture';
  public static readonly PATIENT_MEDICAL_RECORD =
    '/patients/:grantId/medical-record';

  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
  public static readonly REVOKE_FULL = `${this.BASE}${this.REVOKE}`;
  public static readonly LIKE_FULL = `${this.BASE}${this.LIKE}`;
  public static readonly PATIENTS_FULL = `${this.BASE}${this.PATIENTS}`;
  public static readonly PATIENT_BY_GRANT_ID_FULL = `${this.BASE}${this.PATIENT_BY_GRANT_ID}`;
  public static readonly PATIENT_PROFILE_PICTURE_FULL = `${this.BASE}${this.PATIENT_PROFILE_PICTURE}`;
  public static readonly PATIENT_MEDICAL_RECORD_FULL = `${this.BASE}${this.PATIENT_MEDICAL_RECORD}`;
}

export class DoctorGrantPaths {
  public static readonly BASE = '/patient-doctor-grants';
  public static readonly LIKE = '/:id/like';
  public static readonly TOGGLE_DOCUMENT = '/:id/toggle-document/:documentId';
  public static readonly TOGGLE_ALL_DOCUMENTS = '/:id/toggle-all-documents';
  public static readonly TOGGLE_PERSISTENT = '/:id/toggle-persistent';
  public static readonly DOCUMENTS = '/:id/documents';
  public static readonly DOCUMENT_FILTERS = '/:id/documents/available-filters';
  public static readonly DOCUMENT_BY_ID = '/:id/documents/:documentId';
  public static readonly DOCUMENT_RENAME = '/:id/documents/:documentId/rename';
  public static readonly DOCUMENT_STREAM =
    '/:id/documents/:documentId/media/:mediaId/stream';
  public static readonly DOCUMENT_DOWNLOAD =
    '/:id/documents/:documentId/download';
  public static readonly GRANTED_DOCTORS = '/granted-doctors';
  public static readonly GRANTED_DOCTOR_BY_GRANT_ID =
    '/granted-doctors/:grantId';
  public static readonly GRANTED_DOCTOR_PROFILE_PICTURE =
    '/granted-doctors/:grantId/profile-picture';

  public static readonly LIKE_FULL = `${this.BASE}${this.LIKE}`;
  public static readonly DOCUMENTS_FULL = `${this.BASE}${this.DOCUMENTS}`;
  public static readonly DOCUMENT_BY_ID_FULL = `${this.BASE}${this.DOCUMENT_BY_ID}`;
  public static readonly GRANTED_DOCTORS_FULL = `${this.BASE}${this.GRANTED_DOCTORS}`;
  public static readonly GRANTED_DOCTOR_BY_GRANT_ID_FULL = `${this.BASE}${this.GRANTED_DOCTOR_BY_GRANT_ID}`;
}

export class InstitutionGrantPaths {
  public static readonly BASE = '/patient-institution-grants';
  public static readonly LIKE = '/:id/like';
  public static readonly DOCUMENTS = '/:id/documents';
  public static readonly DOCUMENT_FILTERS = '/:id/documents/available-filters';
  public static readonly DOCUMENT_BY_ID = '/:id/documents/:documentId';
  public static readonly DOCUMENT_RENAME = '/:id/documents/:documentId/rename';
  public static readonly DOCUMENT_STREAM =
    '/:id/documents/:documentId/media/:mediaId/stream';
  public static readonly DOCUMENT_DOWNLOAD =
    '/:id/documents/:documentId/download';
  public static readonly GRANTED_INSTITUTIONS = '/granted-institutions';
  public static readonly GRANTED_INSTITUTION_BY_GRANT_ID =
    '/granted-institutions/:grantId';
  public static readonly GRANTED_INSTITUTION_PROFILE_PICTURE =
    '/granted-institutions/:grantId/profile-picture';

  public static readonly LIKE_FULL = `${this.BASE}${this.LIKE}`;
  public static readonly DOCUMENTS_FULL = `${this.BASE}${this.DOCUMENTS}`;
  public static readonly DOCUMENT_BY_ID_FULL = `${this.BASE}${this.DOCUMENT_BY_ID}`;
  public static readonly GRANTED_INSTITUTIONS_FULL = `${this.BASE}${this.GRANTED_INSTITUTIONS}`;
  public static readonly GRANTED_INSTITUTION_BY_GRANT_ID_FULL = `${this.BASE}${this.GRANTED_INSTITUTION_BY_GRANT_ID}`;
}

export class InsightsPaths {
  public static readonly BASE = '/insights';
  public static readonly TOTALS = '/totals';
  public static readonly NEW_PATIENTS = '/new-patients';
  public static readonly PATIENT_PROFILE_PICTURE = '/patients/:grantId/profile-picture';
}
