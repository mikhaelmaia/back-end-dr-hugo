import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager, Equal, Not } from 'typeorm';
import { BaseEntityDto } from '../../base/base.entity.dto';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  public async validate(
    value: any,
    args: ValidationArguments,
  ): Promise<boolean> {
    const [tableName, column] = args.constraints;
    const id: string = (args.object as BaseEntityDto<any>).id;
    return (
      (await this.entityManager.getRepository(tableName).count({
        where: {
          [column]: value,
          ...(id ? { id: Not(Equal(id)) } : {}),
        },
      })) === 0
    );
  }
}

export function IsUnique(
  tableName: string,
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [tableName, property],
      validator: IsUniqueConstraint,
    });
  };
}
