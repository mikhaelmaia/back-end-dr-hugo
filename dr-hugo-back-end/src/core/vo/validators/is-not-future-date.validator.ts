import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { provideIsNotFutureDateValidationMessage } from '../consts/validation-messages';

@ValidatorConstraint({ async: false })
@Injectable()
export class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  public validate(value: any): boolean {
    if (!value) return true;

    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return inputDate <= today;
  }

  public defaultMessage(): string {
    return provideIsNotFutureDateValidationMessage();
  }
}

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotFutureDateConstraint,
    });
  };
}
