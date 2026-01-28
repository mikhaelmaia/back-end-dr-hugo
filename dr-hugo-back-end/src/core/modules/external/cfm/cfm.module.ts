import { Module } from "@nestjs/common";
import { CfmService } from "./cfm.service";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
  ],
    providers: [CfmService],
    exports: [CfmService],
})
export class CfmModule {}