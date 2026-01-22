import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class OnlyLettersValidator implements ValidatorConstraintInterface {
  public validate(value: string, args: ValidationArguments): boolean {
    if (!value || typeof value !== 'string') {
      return true;
    }

    const onlyLettersRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return onlyLettersRegex.test(value);
  }

  public defaultMessage(args: ValidationArguments): string {
    return `${args.property} deve conter apenas letras, espaços e caracteres básicos de pontuação`;
  }
}

export function IsOnlyLetters(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: OnlyLettersValidator,
    });
  };
}