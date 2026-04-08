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
}
