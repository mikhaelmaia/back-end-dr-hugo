import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { findEnumValueByKeyOrValue } from 'src/core/utils/enum.utils';

export function IsEnumKey<T extends Record<string, string | number>>(
  enumObject: T,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEnumKey',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [enumObject],
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          const [targetEnum] = args.constraints as [T];
          const enumValue = findEnumValueByKeyOrValue(targetEnum, value);

          if (enumValue !== undefined) {
            (args.object as Record<string, any>)[args.property] = enumValue;
            return true;
          }

          return false;
        },
        defaultMessage(args: ValidationArguments): string {
          const [targetEnum] = args.constraints as [T];
          const enumKeys = Object.keys(targetEnum);
          return `${args.property} deve ser um dos seguintes valores: ${enumKeys.join(', ')}`;
        },
      },
    });
  };
}
