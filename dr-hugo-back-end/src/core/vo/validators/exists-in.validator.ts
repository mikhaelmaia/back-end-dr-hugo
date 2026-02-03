import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from 'typeorm';
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
    if (Array.isArray(value)) {
      return Promise.all(
        value.map((val) => this.validateSingle(val, args)),
      ).then((results) => results.every((result) => result));
    }
    return this.validateSingle(value, args);
  }

  public async validateSingle(
    value: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const [tableName, column] = args.constraints;
    const uuidPresent: boolean = Optional.ofNullable(value)
      .filter((value) => value.length > 0)
      .filter((value) => UUID_REGEX.test(value))
      .isPresent();
    if (!uuidPresent) {
      return false;
    }
    const count = await this.entityManager
      .getRepository(tableName)
      .count({ where: { [column]: value } });

    return count > 0;
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
