import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class ContainsRequiredTermsValidator implements ValidatorConstraintInterface {
  public validate(value: any, args: ValidationArguments): boolean {
    if (!Array.isArray(value)) {
      return false;
    }

    if (value.length === 0) {
      return false;
    }

    const requiredTerms = (args.constraints[0] || []) as string[];
    
    return requiredTerms.every(term => value.includes(term));
  }

  public defaultMessage(args: ValidationArguments): string {
    const requiredTerms = args.constraints[0] || [];
    return `Todos os termos obrigatórios devem ser aceitos: ${requiredTerms.join(', ')}`;
  }
}

export function ContainsRequiredTerms(requiredTerms: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [requiredTerms],
      validator: ContainsRequiredTermsValidator,
    });
  };
}