import { Module } from '@nestjs/common';
import { ReceitaWsModule } from './receitaws/receitaws.module';
import { CfmModule } from './cfm/cfm.module';
import { ViaCepModule } from './viacep/viacep.module';

@Module({
  imports: [ReceitaWsModule, CfmModule, ViaCepModule],
  exports: [ReceitaWsModule, CfmModule, ViaCepModule],
})
export class ExternalModule {}