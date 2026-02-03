/**
 * Utilitários para trabalhar com enums
 */

/**
 * Encontra a chave de um enum pelo valor
 * @param enumObject O enum a ser pesquisado
 * @param value O valor a ser procurado
 * @returns A chave do enum correspondente ao valor, ou undefined se não encontrado
 */
export function findEnumKeyByValue<T extends Record<string, string | number>>(
  enumObject: T,
  value: string | number,
): keyof T | undefined {
  return Object.keys(enumObject).find((key) => enumObject[key] === value) as
    | keyof T
    | undefined;
}

export function findEnumByKeyValue<T extends Record<string, string | number>>(
  enumObject: T,
  value: string | number,
): T[keyof T] | undefined {
  const key = Object.keys(enumObject).find(
    (key) => enumObject[key] === value,
  ) as keyof T | undefined;
  return key ? enumObject[key] : undefined;
}

export function findEnumValueByKeyOrValue<
  T extends Record<string, string | number>,
>(enumObject: T, input: string | number): T[keyof T] | undefined {
  const normalizedInput = normalizeEnumValue(String(input));

  const key = Object.keys(enumObject).find((key) => {
    const enumKey = normalizeEnumValue(key);
    const enumValue = normalizeEnumValue(String(enumObject[key]));

    return enumKey === normalizedInput || enumValue === normalizedInput;
  }) as keyof T | undefined;

  return key ? enumObject[key] : undefined;
}

export function findEnumStringValueByKey<T extends Record<string, string>>(
  enumObject: T,
  key: keyof T,
): string | undefined {
  return enumObject[key];
}

/**
 * Verifica se um valor existe em um enum
 * @param enumObject O enum a ser verificado
 * @param value O valor a ser procurado
 * @returns true se o valor existe no enum, false caso contrário
 */
export function isValidEnumValue<T extends Record<string, string | number>>(
  enumObject: T,
  value: string | number,
): value is T[keyof T] {
  return Object.values(enumObject).includes(value as T[keyof T]);
}

/**
 * Obtém todos os valores de um enum
 * @param enumObject O enum
 * @returns Array com todos os valores do enum
 */
export function getEnumValues<T extends Record<string, string | number>>(
  enumObject: T,
): T[keyof T][] {
  return Object.values(enumObject) as T[keyof T][];
}

/**
 * Obtém todas as chaves de um enum
 * @param enumObject O enum
 * @returns Array com todas as chaves do enum
 */
export function getEnumKeys<T extends Record<string, string | number>>(
  enumObject: T,
): (keyof T)[] {
  return Object.keys(enumObject) as (keyof T)[];
}

/**
 * Converte um enum em um array de objetos com key e value
 * @param enumObject O enum
 * @returns Array de objetos com propriedades key e value
 */
export function enumToKeyValueArray<T extends Record<string, string | number>>(
  enumObject: T,
): { key: keyof T; value: T[keyof T] }[] {
  return Object.entries(enumObject).map(([key, value]) => ({
    key: key as keyof T,
    value: value as T[keyof T],
  }));
}

function normalizeEnumValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}
