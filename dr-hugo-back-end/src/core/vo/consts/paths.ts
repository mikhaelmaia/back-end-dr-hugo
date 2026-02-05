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

  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
  public static readonly FIND_BY_ID_FULL = `${this.BASE}${this.FIND_BY_ID}`;
  public static readonly BY_USER_FULL = `${this.BASE}${this.BY_USER}`;
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

  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
  public static readonly FIND_BY_ID_FULL = `${this.BASE}${this.FIND_BY_ID}`;
  public static readonly UPDATE_FULL = `${this.BASE}${this.UPDATE}`;
  public static readonly DELETE_FULL = `${this.BASE}${this.DELETE}`;
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
  public static readonly BY_USER = '/by-user/:userId';

  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
  public static readonly FIND_BY_ID_FULL = `${this.BASE}${this.FIND_BY_ID}`;
  public static readonly BY_USER_FULL = `${this.BASE}${this.BY_USER}`;
  public static readonly UPDATE_FULL = `${this.BASE}${this.UPDATE}`;
  public static readonly DELETE_FULL = `${this.BASE}${this.DELETE}`;
  public static readonly FIND_ALL_FULL = `${this.BASE}${this.FIND_ALL}`;
  public static readonly LOOKUP_FULL = `${this.BASE}${this.LOOKUP}`;
}

export class DoctorPaths extends BasePaths {
  public static readonly BASE = '/doctors';
  public static readonly LOOKUP = '/lookup';

  public static readonly CREATE_FULL = `${this.BASE}${this.CREATE}`;
  public static readonly LOOKUP_FULL = `${this.BASE}${this.LOOKUP}`;
}

export class MedicalRecordPaths extends BasePaths {
  public static readonly BASE = '/medical-records';
}
