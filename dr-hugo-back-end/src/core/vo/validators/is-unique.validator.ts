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
import { CryptoService } from '../../modules/crypto/crypto.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly cryptoService: CryptoService,
  ) {}

  public async validate(
    value: any,
    args: ValidationArguments,
  ): Promise<boolean> {
    const [tableName, column, useHash] = args.constraints;
    const id: string = (args.object as BaseEntityDto<any>).id;

    const searchColumn = useHash ? `${column}Hash` : column;
    const searchValue = useHash
      ? this.cryptoService.hashForSearch(value)
      : value;

    return (
      (await this.entityManager.getRepository(tableName).count({
        where: {
          [searchColumn]: searchValue,
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
  useHash?: boolean,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [tableName, property, useHash],
      validator: IsUniqueConstraint,
    });
  };
}
