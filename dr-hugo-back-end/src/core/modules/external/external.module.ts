import { Module } from '@nestjs/common';
import { ReceitaWsModule } from './receitaws/receitaws.module';
import { CfmModule } from './cfm/cfm.module';

@Module({
  imports: [ReceitaWsModule, CfmModule],
  exports: [ReceitaWsModule, CfmModule],
})
export class ExternalModule {}