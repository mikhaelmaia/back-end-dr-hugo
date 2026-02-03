import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class TaxIdValidator implements ValidatorConstraintInterface {
  public validate(taxId: string, args: ValidationArguments): boolean {
    if (!taxId || !/^\d{11}|\d{14}$/.test(taxId)) {
      return false;
    }

    const isCpf = taxId.length === 11 && this.validateCpf(taxId);
    const isCnpj = taxId.length === 14 && this.validateCnpj(taxId);

    return isCpf || isCnpj;
  }

  public defaultMessage(args: ValidationArguments): string {
    return `O Tax ID fornecido é inválido. Deve ser um CPF ou CNPJ válido.`;
  }

  private validateCpf(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return false;
    }

    const validateDigit = (digitPosition: number) => {
      const sum = cpf
        .slice(0, digitPosition)
        .split('')
        .reduce(
          (acc, digit, index) =>
            acc + parseInt(digit, 10) * (digitPosition + 1 - index),
          0,
        );
      const rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    };

    return (
      validateDigit(9) === parseInt(cpf[9], 10) &&
      validateDigit(10) === parseInt(cpf[10], 10)
    );
  }

  private validateCnpj(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
      return false;
    }

    const validateDigit = (digitPosition: number) => {
      const weights =
        digitPosition === 12
          ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
          : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const sum = cnpj
        .slice(0, digitPosition)
        .split('')
        .reduce(
          (acc, digit, index) => acc + parseInt(digit, 10) * weights[index],
          0,
        );
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };

    return (
      validateDigit(12) === parseInt(cnpj[12], 10) &&
      validateDigit(13) === parseInt(cnpj[13], 10)
    );
  }
}

export function IsValidTaxId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: TaxIdValidator,
    });
  };
}
