export class EmailReference {
  private constructor(
    public readonly subject: string,
    public readonly templateName: string,
  ) {}

  public static readonly USER_REGISTERED = new EmailReference(
    'Usuário Cadastrado',
    'user-registered',
  );
  public static readonly EMAIL_CONFIRMATION = new EmailReference(
    'Confirmação de E-mail',
    'email-confirmation',
  );
  public static readonly EMAIL_CONFIRMED = new EmailReference(
    'E-mail Confirmado',
    'email-confirmed',
  );
  public static readonly PASSWORD_RESET_REQUEST = new EmailReference(
    'Solicitação de Redefinição de Senha',
    'password-reset-request',
  );
  public static readonly PASSWORD_RESET = new EmailReference(
    'Senha Redefinida',
    'password-reset',
  );
  public static readonly EMAIL_CHANGE_CONFIRMATION = new EmailReference(
    'Confirmação de Alteração de E-mail',
    'email-change-confirmation',
  );
  public static readonly EMAIL_CHANGED_WARNING = new EmailReference(
    'Aviso de Alteração de E-mail',
    'email-changed-warning',
  );
  public static readonly EMAIL_CHANGED_CONFIRMATION = new EmailReference(
    'E-mail Alterado com Sucesso',
    'email-changed-confirmation',
  );
}
