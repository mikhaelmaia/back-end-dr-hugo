import { Transform } from 'class-transformer';
import { stringToLocalDate } from '../../utils/date-time.utils';

/**
 * Decorator que converte strings de data para Date objects,
 * zerando o horário para evitar problemas de timezone.
 * 
 * Use este decorator em vez de @Type(() => Date) para campos de data
 * que devem representar apenas datas (sem horário específico),
 * como data de nascimento.
 */
export function ToLocalDate() {
  return Transform(({ value }) => {
    if (!value) return value;
    
    // Se já é um Date, apenas zera o horário (UTC para evitar shift de timezone)
    if (value instanceof Date) {
      const date = new Date(value);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }
    
    // Se é string, usa a função stringToLocalDate
    if (typeof value === 'string') {
      return stringToLocalDate(value);
    }
    
    return value;
  });
}