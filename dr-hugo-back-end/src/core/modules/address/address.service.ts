import { Injectable } from "@nestjs/common";
import { AddressAdapter } from "./address.adapter";
import { AddressDto } from "./dtos/address.dto";

@Injectable()
export class AddressService {
    
    constructor(
        private readonly addressAdapter: AddressAdapter
    ) { }

    public async getAddressByZipCode(zipCode: string): Promise<AddressDto> {
        const cleanZipCode = zipCode.replaceAll(/\D/g, '');
    
        return this.addressAdapter.getAddressByZipCode(cleanZipCode);
    }

}