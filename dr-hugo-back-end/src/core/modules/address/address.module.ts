import { Module } from "@nestjs/common";
import { AddressAdapter } from "./address.adapter";
import { AddressService } from "./address.service";
import { AddressController } from "./address.controller";
import { ExternalModule } from "../external/external.module";

@Module({
    imports: [ExternalModule],
    providers: [AddressAdapter, AddressService],
    controllers: [AddressController],
    exports: [AddressService],
})
export class AddressModule {}