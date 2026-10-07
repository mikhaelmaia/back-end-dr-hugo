import { Module } from '@nestjs/common';
import { ReceitaWsModule } from './receitaws/receitaws.module';
import { CfmModule } from './cfm/cfm.module';
import { ViaCepModule } from './viacep/viacep.module';
import { CnesModule } from './cnes/cnes.module';
import { ZApiModule } from './z-api/z-api.module';

@Module({
  imports: [ReceitaWsModule, CfmModule, ViaCepModule, CnesModule, ZApiModule],
  exports: [ReceitaWsModule, CfmModule, ViaCepModule, CnesModule, ZApiModule],
})
export class ExternalModule {}
