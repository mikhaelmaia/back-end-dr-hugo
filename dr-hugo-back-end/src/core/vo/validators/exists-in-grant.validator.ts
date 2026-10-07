import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from 'typeorm';
import { InstitutionalUserRole } from '../consts/enums';
import { UUID_REGEX } from '../decorators/is-uuid-param.decorator';

@ValidatorConstraint({ async: true })
@Injectable()
export class ExistsInGrantValidator implements ValidatorConstraintInterface {
  private readonly grantTableMap: Record<InstitutionalUserRole, string> = {
    [InstitutionalUserRole.DOCTOR]: 'dv_patient_doctor_grant',
    [InstitutionalUserRole.INSTITUTION]: 'dv_patient_institution_grant',
  };

  constructor(private readonly entityManager: EntityManager) {}

  public async validate(
    value: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const role = (args.object as any).role as InstitutionalUserRole;
    const tableName = this.grantTableMap[role];

    if (!tableName || !value || !UUID_REGEX.test(value)) {
      return false;
    }

    const repository = this.entityManager.getRepository(tableName);
    return repository.exists({ where: { id: value } });
  }

  public defaultMessage(): string {
    return 'Concessão não encontrada';
  }
}

export function ExistsInGrant(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: ExistsInGrantValidator,
    });
  };
}
