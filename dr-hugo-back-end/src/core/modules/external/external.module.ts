import { Module } from '@nestjs/common';
import { ReceitaWsModule } from './receitaws/receitaws.module';
import { CfmModule } from './cfm/cfm.module';
import { ViaCepModule } from './viacep/viacep.module';
import { CnesModule } from './cnes/cnes.module';

@Module({
  imports: [ReceitaWsModule, CfmModule, ViaCepModule, CnesModule],
  exports: [ReceitaWsModule, CfmModule, ViaCepModule, CnesModule],
})
export class ExternalModule {}