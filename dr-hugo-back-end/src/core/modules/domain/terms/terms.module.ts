import { Module } from "@nestjs/common";
import { TermsService } from "./terms.service";

@Module({
    providers: [TermsService],
    exports: [TermsService],
})
export class TermsModule {}