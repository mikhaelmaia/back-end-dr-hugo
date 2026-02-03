import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { blacklistedWords } from '../data/blacklist';
import { Optional } from '../../utils/optional';

@ValidatorConstraint({ async: false })
export class BlacklistedValidator implements ValidatorConstraintInterface {
  public validate(text: string, args: ValidationArguments): boolean {
    return (
      Optional.ofNullable(text)
        .filter((text) => typeof text === 'string')
        .isEmpty() ||
      !blacklistedWords.some((char) => {
        if (char.length <= 5) return text.split(' ').includes(char);
        return text.includes(char);
      })
    );
  }

  public defaultMessage(args: ValidationArguments): string {
    return `O texto contém palavras proibidas`;
  }
}

export function IsNotBlacklisted(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BlacklistedValidator,
    });
  };
}
