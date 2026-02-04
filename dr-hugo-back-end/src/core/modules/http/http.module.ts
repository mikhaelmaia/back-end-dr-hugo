import { Module } from '@nestjs/common';
import { NoCacheInterceptor } from 'src/core/config/interceptors/no-cache.interceptor';

@Module({
  providers: [NoCacheInterceptor],
  exports: [NoCacheInterceptor],
})
export class InternalHttpModule {}
