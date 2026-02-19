import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { provideIsWithinValidAgeValidationMessage } from '../consts/validation-messages';

@ValidatorConstraint({ async: false })
@Injectable()
export class IsWithinValidAgeConstraint implements ValidatorConstraintInterface {
  public validate(value: any): boolean {
    if (!value) return true;

    const inputDate = new Date(value);
    const today = new Date();
    const maxAge = 120;

    const minBirthDate = new Date();
    minBirthDate.setFullYear(today.getFullYear() - maxAge);

    return inputDate >= minBirthDate;
  }

  public defaultMessage(): string {
    return provideIsWithinValidAgeValidationMessage();
  }
}

export function IsWithinValidAge(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsWithinValidAgeConstraint,
    });
  };
}
