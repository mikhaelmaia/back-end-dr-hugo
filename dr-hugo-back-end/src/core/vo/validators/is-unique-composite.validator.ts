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

export interface IsUniqueCompositeOptions {
  tableName: string;
  column: string;
  additionalField: string | { column: string; value: any };
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueCompositeConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  public async validate(
    value: any,
    args: ValidationArguments,
  ): Promise<boolean> {
    const options: IsUniqueCompositeOptions = args.constraints[0];
    const id: string = (args.object as BaseEntityDto<any>).id;

    let additionalFieldValue: any;
    let additionalColumnName: string;

    if (typeof options.additionalField === 'string') {
      additionalFieldValue = (args.object as any)[options.additionalField];
      additionalColumnName = options.additionalField;
    } else {
      additionalFieldValue = options.additionalField.value;
      additionalColumnName = options.additionalField.column;
    }

    if (additionalFieldValue === undefined || additionalFieldValue === null) {
      return true;
    }

    const whereCondition = {
      [options.column]: value,
      [additionalColumnName]: additionalFieldValue,
      ...(id ? { id: Not(Equal(id)) } : {}),
    };

    return (
      (await this.entityManager.getRepository(options.tableName).count({
        where: whereCondition,
      })) === 0
    );
  }

  public defaultMessage(args: ValidationArguments): string {
    const options: IsUniqueCompositeOptions = args.constraints[0];
    return `Já existe um registro com essa combinação de ${options.column} no sistema`;
  }
}

/**
 * Validator para verificar se a combinação de campos é única na base de dados
 * 
 * @param options Configurações do validator
 * @param validationOptions Opções de validação padrão do class-validator
 * 
 * @example
 * // Usando valor estático para role
 * @IsUniqueComposite({
 *   tableName: 'dv_user',
 *   column: 'email',
 *   additionalField: { column: 'role', value: 'PATIENT' }
 * })
 * public email: string;
 * 
 * @example  
 * // Usando campo dinâmico do objeto
 * @IsUniqueComposite({
 *   tableName: 'dv_user',
 *   column: 'email', 
 *   additionalField: 'role'
 * })
 * public email: string;
 */
export function IsUniqueComposite(
  options: IsUniqueCompositeOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueCompositeConstraint,
    });
  };
}