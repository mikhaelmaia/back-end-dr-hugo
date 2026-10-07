import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager, In } from 'typeorm';
import { Optional } from '../../utils/optional';
import { UUID_REGEX } from '../decorators/is-uuid-param.decorator';

@ValidatorConstraint({ async: true })
@Injectable()
export class ExistsInValidator implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  public async validate(
    value: string | string[],
    args: ValidationArguments,
  ): Promise<boolean> {
    const [tableName, column] = args.constraints;

    const repository = this.entityManager.getRepository(tableName);

    if (Array.isArray(value)) {
      const validUuids = value.filter((v) => v && UUID_REGEX.test(v));

      if (validUuids.length !== value.length) {
        return false;
      }

      const count = await repository.count({
        where: { [column]: In(validUuids) },
      });

      return count === validUuids.length;
    }

    if (!value || !UUID_REGEX.test(value)) {
      return false;
    }

    const exists = await repository.exist({
      where: { [column]: value },
    });

    return exists;
  }
}

export function ExistsIn(
  tableName: string,
  column: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [tableName, column],
      validator: ExistsInValidator,
    });
  };
}
