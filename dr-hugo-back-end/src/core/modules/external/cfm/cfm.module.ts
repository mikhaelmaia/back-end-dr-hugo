import { Module } from "@nestjs/common";
import { CfmService } from "./cfm.service";

@Module({
    providers: [CfmService],
    exports: [CfmService],
})
export class CfmModule {}