export type WhatsAppTemplateParamsMap = {
  PHONE_CHANGE_REQUEST: {
    confirmationUrl: string;
  };
  PHONE_CHANGED_WARNING: {
    newPhone: string;
  };
  INSTITUTION_ACCESS_GRANTED: {
    corporateName: string;
    cnes: string;
    cnpj: string;
    grantedAt: string;
    accessUrl: string;
  };
  DOCTOR_ACCESS_GRANTED: {
    name: string;
    crm: string;
    crmUf: string;
    grantedAt: string;
    accessUrl: string;
  };
  PATIENT_DOCTOR_GRANT: {
    patientName: string;
    doctorName: string;
    grantedAt: string;
    persistent: boolean;
    doctorProfileUrl: string;
  };
  PATIENT_INSTITUTION_GRANT: {
    patientName: string;
    institutionName: string;
    grantedAt: string;
    persistent: boolean;
    institutionProfileUrl: string;
  };
  PATIENT_DOCUMENT_UPLOADED: {
    patientName: string;
    institutionName: string;
    uploadedAt: string;
    documentUrl: string;
  };
  DOCTOR_RECEIVE_PATIENT_GRANT: {
    doctorName: string;
    patientName: string;
    grantedAt: string;
    persistent: boolean;
    patientProfileUrl: string;
  };
  INSTITUTION_RECEIVE_PATIENT_GRANT: {
    institutionName: string;
    patientName: string;
    grantedAt: string;
    persistent: boolean;
    patientProfileUrl: string;
  };
};

export class WhatsAppReference<T extends keyof WhatsAppTemplateParamsMap> {
  private constructor(public readonly key: T) {}

  public static readonly PHONE_CHANGE_REQUEST = new WhatsAppReference(
    'PHONE_CHANGE_REQUEST',
  );

  public static readonly PHONE_CHANGED_WARNING = new WhatsAppReference(
    'PHONE_CHANGED_WARNING',
  );

  public static readonly INSTITUTION_ACCESS_GRANTED = new WhatsAppReference(
    'INSTITUTION_ACCESS_GRANTED',
  );

  public static readonly DOCTOR_ACCESS_GRANTED = new WhatsAppReference(
    'DOCTOR_ACCESS_GRANTED',
  );

  public static readonly PATIENT_DOCTOR_GRANT = new WhatsAppReference(
    'PATIENT_DOCTOR_GRANT',
  );

  public static readonly PATIENT_INSTITUTION_GRANT = new WhatsAppReference(
    'PATIENT_INSTITUTION_GRANT',
  );

  public static readonly PATIENT_DOCUMENT_UPLOADED = new WhatsAppReference(
    'PATIENT_DOCUMENT_UPLOADED',
  );

  public static readonly DOCTOR_RECEIVE_PATIENT_GRANT = new WhatsAppReference(
    'DOCTOR_RECEIVE_PATIENT_GRANT',
  );

  public static readonly INSTITUTION_RECEIVE_PATIENT_GRANT =
    new WhatsAppReference('INSTITUTION_RECEIVE_PATIENT_GRANT');
}
