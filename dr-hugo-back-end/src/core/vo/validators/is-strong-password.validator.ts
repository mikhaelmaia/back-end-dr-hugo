import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class StrongPasswordValidator implements ValidatorConstraintInterface {
  public validate(value: string, args: ValidationArguments): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    if (value.length < 8) {
      return false;
    }

    const hasNumber = /\d/.test(value);
    
    const hasUpperCase = /[A-Z]/.test(value);
    
    const hasSpecialChar = /[!#$%@&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    return hasNumber && hasUpperCase && hasSpecialChar;
  }

  public defaultMessage(args: ValidationArguments): string {
    return 'A senha deve ter no mínimo 8 caracteres, um número, uma letra maiúscula e um caractere especial (ex: !#$%@)';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: StrongPasswordValidator,
    });
  };
}