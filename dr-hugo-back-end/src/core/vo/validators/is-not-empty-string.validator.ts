import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class NotEmptyStringValidator implements ValidatorConstraintInterface {
  public validate(value: string, args: ValidationArguments): boolean {
    return typeof value === 'string' && value.trim() !== '';
  }

  public defaultMessage(args: ValidationArguments): string {
    return `${args.property} não pode ser uma string vazia ou composta apenas por espaços em branco`;
  }
}

export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NotEmptyStringValidator,
    });
  };
}
