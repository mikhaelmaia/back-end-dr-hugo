import { Module } from '@nestjs/common';
import { WhatsAppTemplateEngine } from './whatsapp-template-engine.service';
import { WhatsAppHelper } from './whatsapp.helper';
import { ExternalModule } from '../external/external.module';
import { ResolutionKeyModule } from '../resolution-key/resolution-key.module';

@Module({
  imports: [ExternalModule, ResolutionKeyModule],
  providers: [WhatsAppTemplateEngine, WhatsAppHelper],
  exports: [WhatsAppHelper],
})
export class WhatsAppModule {}
