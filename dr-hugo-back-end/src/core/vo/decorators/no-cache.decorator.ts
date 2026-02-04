import { UseInterceptors } from '@nestjs/common';
import { NoCacheInterceptor } from 'src/core/config/interceptors/no-cache.interceptor';

export function NoCache() {
  return UseInterceptors(NoCacheInterceptor);
}
