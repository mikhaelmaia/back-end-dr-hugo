import { ValidationArguments } from 'class-validator';

export const provideIsNotEmptyValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} não pode ser vazio`;
};

export const provideIsNumberValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ser um número`;
};

export const provideIsStringValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ser um texto`;
};

export const provideIsNotEmptyStringValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} não pode ser um texto em branco`;
};

export const provideIsEmailValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ser um e-mail válido`;
};

export const provideMaxLengthValidationMessage = (
  validationArguments: string | ValidationArguments,
  max: number = 255,
): string => {
  let maxLengthText = '';
  if (typeof validationArguments !== 'string') {
    maxLengthText = 'de ' + (validationArguments.constraints[0] ?? max);
  }
  return ` ${getPropertyFromParameter(validationArguments)} atingiu o máximo de caracteres permitidos ${maxLengthText}`;
};

export const provideMinLengthValidationMessage = (
  validationArguments: string | ValidationArguments,
  max: number = 6,
): string => {
  let minLengthText = '';
  if (typeof validationArguments !== 'string') {
    minLengthText = `de ${validationArguments.constraints[0] ?? max}`;
  }
  return ` ${getPropertyFromParameter(validationArguments)} não atingiu o mínimo de caracteres permitidos ${minLengthText}`;
};

export const provideLengthValidationMessage = (
  validationArguments: ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ter entre ${validationArguments.constraints[0]} e ${validationArguments.constraints[1]} caracteres`;
};

export const provideIsIntValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ser um número inteiro`;
};

export const provideIsBooleanValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ser um valor booleano`;
};

export const provideIsDateValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve estar no formato de data e hora`;
};

export const provideIsDateStringValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve estar no formato de data válido`;
};

export const provideIsUUIDValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ser um UUID válido`;
};

export const provideIsValidTaxIdValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ser um CPF/CNPJ válido`;
};

export const provideMaxValidationMessage = (
  validationArguments: string | ValidationArguments,
  max: number = 1000,
): string => {
  let maxText = '';
  if (typeof validationArguments !== 'string') {
    maxText = 'de ' + (validationArguments.constraints[0] ?? max);
  }
  return `${getPropertyFromParameter(validationArguments)} atingiu o valor máximo ${maxText}`;
};

export const provideIsArrayValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ser uma lista`;
};

export const provideArrayNotEmptyValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `Ao menos um(a) ${getPropertyFromParameter(validationArguments)} deve ser informado(a)`;
};

export const provideArrayMaxSizeValidationMessage = (
  validationArguments: string | ValidationArguments,
  max: number = 255,
): string => {
  let maxText = '';
  if (typeof validationArguments !== 'string') {
    maxText = 'de ' + (validationArguments.constraints[0] ?? max);
  }
  return `O número máximo de ${getPropertyFromParameter(validationArguments)} é ${maxText}`;
};

export const provideIsEnumValidationMessage = (
  validationArguments: string | ValidationArguments,
  enumType: Record<string, any>,
): string => {
  const enumValues = Object.values(enumType).join(', ');
  return `${getPropertyFromParameter(validationArguments)} deve ser um dos seguintes valores: ${enumValues}`;
};

export const provideIsObjectValidationMessage = (
  validationArguments: string | ValidationArguments,
): string => {
  return `${getPropertyFromParameter(validationArguments)} deve ser um objeto válido`;
};

const getPropertyFromParameter = (
  validationArguments: ValidationArguments | string,
): string => {
  return typeof validationArguments === 'string'
    ? validationArguments
    : validationArguments.property;
};
