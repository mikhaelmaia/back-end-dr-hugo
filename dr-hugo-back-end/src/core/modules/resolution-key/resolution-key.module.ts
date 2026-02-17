import { Module } from '@nestjs/common';
import { ResolutionKeyService } from './resolution-key.service';
import { ResolutionKeyController } from './resolution-key.controller';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [ResolutionKeyService],
  controllers: [ResolutionKeyController],
  exports: [ResolutionKeyService],
})
export class ResolutionKeyModule {}
