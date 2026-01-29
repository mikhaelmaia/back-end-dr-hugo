/**
 * Utilitários para manipulação de datas e horários
 */

/**
 * Obtém a data e hora atual formatada para o locale brasileiro
 * @param locale Locale para formatação (padrão: 'pt-BR')
 * @param timezone Timezone para conversão (padrão: 'America/Sao_Paulo')
 * @returns Data e hora formatada como string
 */
export const getCurrentLocalDateTimeFormatted = (
  locale: string = 'pt-BR',
  timezone: string = 'America/Sao_Paulo',
): string => {
  return new Date().toLocaleString(locale, { timeZone: timezone });
};

/**
 * Converte string para Date (LocalDateTime)
 * @param dateString String da data no formato ISO, 'YYYY-MM-DD' ou 'DD/MM/YYYY'
 * @returns Date object ou null se inválida
 */
export const stringToLocalDateTime = (dateString: string): Date | null => {
  if (!dateString) return null;

  try {
    // Tenta formato ISO primeiro
    if (dateString.includes('T') || dateString.includes('Z')) {
      return new Date(dateString);
    }

    // Formato brasileiro DD/MM/YYYY ou DD/MM/YYYY HH:mm:ss
    if (dateString.includes('/')) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      
      if (timePart) {
        const [hour, minute, second] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute, second || 0);
      }
      
      return new Date(year, month - 1, day);
    }

    // Formato YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss
    if (dateString.includes('-')) {
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      
      if (timePart) {
        const [hour, minute, second] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute, second || 0);
      }
      
      return new Date(year, month - 1, day);
    }

    // Fallback para new Date()
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

/**
 * Converte string para Date (LocalDate) - apenas data, sem horário
 * @param dateString String da data no formato 'YYYY-MM-DD' ou 'DD/MM/YYYY'
 * @returns Date object com horário zerado ou null se inválida
 */
export const stringToLocalDate = (dateString: string): Date | null => {
  const date = stringToLocalDateTime(dateString);
  if (!date) return null;

  // Zera o horário para ter apenas a data
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Converte Date para string no formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
 * @param date Date object
 * @returns String no formato ISO ou null se data inválida
 */
export const localDateTimeToString = (date: Date): string | null => {
  if (!date || Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

/**
 * Converte Date para string no formato brasileiro (DD/MM/YYYY HH:mm:ss)
 * @param date Date object
 * @param includeTime Se deve incluir horário (padrão: true)
 * @returns String formatada ou null se data inválida
 */
export const localDateTimeToBrazilianString = (date: Date, includeTime: boolean = true): string | null => {
  if (!date || Number.isNaN(date.getTime())) return null;

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Converte Date para string no formato YYYY-MM-DD
 * @param date Date object
 * @returns String no formato YYYY-MM-DD ou null se data inválida
 */
export const localDateToString = (date: Date): string | null => {
  if (!date || Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Verifica se uma string representa uma data válida
 * @param dateString String a ser validada
 * @returns true se for uma data válida
 */
export const isValidDateString = (dateString: string): boolean => {
  const date = stringToLocalDateTime(dateString);
  return date !== null && !Number.isNaN(date.getTime());
};

/**
 * Adiciona dias a uma data
 * @param date Data base
 * @param days Número de dias a adicionar (pode ser negativo)
 * @returns Nova data com os dias adicionados
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Adiciona meses a uma data
 * @param date Data base
 * @param months Número de meses a adicionar (pode ser negativo)
 * @returns Nova data com os meses adicionados
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Adiciona anos a uma data
 * @param date Data base
 * @param years Número de anos a adicionar (pode ser negativo)
 * @returns Nova data com os anos adicionados
 */
export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

/**
 * Calcula a diferença entre duas datas em dias
 * @param date1 Primeira data
 * @param date2 Segunda data
 * @returns Diferença em dias (positivo se date2 > date1)
 */
export const daysDifference = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // horas*minutos*segundos*milissegundos
  return Math.round((date2.getTime() - date1.getTime()) / oneDay);
};

/**
 * Verifica se uma data está no passado
 * @param date Data a ser verificada
 * @returns true se a data for no passado
 */
export const isPastDate = (date: Date): boolean => {
  return date.getTime() < Date.now();
};

/**
 * Verifica se uma data está no futuro
 * @param date Data a ser verificada
 * @returns true se a data for no futuro
 */
export const isFutureDate = (date: Date): boolean => {
  return date.getTime() > Date.now();
};

/**
 * Verifica se uma data é hoje
 * @param date Data a ser verificada
 * @returns true se a data for hoje
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Obtém o início do dia (00:00:00) para uma data
 * @param date Data base
 * @returns Nova data com horário zerado
 */
export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Obtém o fim do dia (23:59:59.999) para uma data
 * @param date Data base
 * @returns Nova data com horário no final do dia
 */
export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Formata uma data para o timezone brasileiro
 * @param date Data a ser formatada
 * @param options Opções de formatação do Intl.DateTimeFormat
 * @returns String formatada
 */
export const formatToBrazilianTimezone = (
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  return date.toLocaleString('pt-BR', { ...defaultOptions, ...options });
};