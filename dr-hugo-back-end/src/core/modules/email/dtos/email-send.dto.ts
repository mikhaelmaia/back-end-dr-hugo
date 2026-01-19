import { EmailReference } from '../consts/email-reference';

export class EmailSend {
  public to: string;
  public reference: EmailReference;
  public templateModel: Map<string, string> = new Map();

  constructor(
    to: string,
    reference: EmailReference,
    templateModel: Map<string, string>,
  ) {
    this.to = to;
    this.reference = reference;
    this.templateModel = templateModel;
  }

  public static builder() {
    return new EmailSendBuilder();
  }
}

export class EmailSendBuilder {
  private _to: string;
  private _reference: EmailReference;
  private _templateModel: Map<string, string> = new Map();

  public to(to: string) {
    this._to = to;
    return this;
  }

  public reference(reference: EmailReference) {
    this._reference = reference;
    return this;
  }

  public addParameter(key: string, value: string) {
    this._templateModel.set(key, value);
    return this;
  }

  public build() {
    return new EmailSend(this._to, this._reference, this._templateModel);
  }
}
