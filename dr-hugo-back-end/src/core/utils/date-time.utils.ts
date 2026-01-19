export const getCurrentLocalDateTimeFormatted = (
  locale: string = 'pt-BR',
  timezone: string = 'America/Sao_Paulo',
): string => {
  return new Date().toLocaleString(locale, { timeZone: timezone });
};
