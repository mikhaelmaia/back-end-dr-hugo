import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Optional } from '../../utils/optional';

const forbiddenDomains: string[] = [];

const URL_REGEX = /^(https?:\/\/)?([^\s$.?#].[^\s]*)$/i;

@ValidatorConstraint({ async: false })
export class LinkValidator implements ValidatorConstraintInterface {
  public validate(link: string, args: ValidationArguments): boolean {
    const validLink: boolean = Optional.ofNullable(link)
      .filter((link) => URL_REGEX.test(link))
      .isPresent();

    if (!validLink) {
      return false;
    }

    try {
      const parsedUrl = new URL(link);

      const domain = parsedUrl.hostname;

      if (forbiddenDomains.includes(domain)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  public defaultMessage(args: ValidationArguments): string {
    return `O link é inválido ou contém um domínio proibido`;
  }
}

export function IsValidLink(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: LinkValidator,
    });
  };
}
