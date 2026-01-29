import { BadRequestException, Injectable } from "@nestjs/common";
import { ViaCepService } from "../external/viacep/viacep.service";
import { AddressDto } from "./dtos/address.dto";
import { acceptFalseThrows } from "src/core/utils/functions";
import { ViaCepAddress } from "../external/viacep/dtos/viacep.dtos";

@Injectable()
export class AddressAdapter {

    constructor(
        private readonly viaCepService: ViaCepService
    ) { }

    public async getAddressByZipCode(zipCode: string): Promise<AddressDto> {
        const addressData = await this.viaCepService.getAddressByCep(zipCode);

        acceptFalseThrows(
            addressData.success,
            () => new BadRequestException(addressData.error.message)
        );

        return this.mapToAddressDto(addressData.addressData);
    }

    private mapToAddressDto(addressData: ViaCepAddress): AddressDto {
        const addressDto = new AddressDto();

        addressDto.street = addressData.logradouro;
        addressDto.neighborhood = addressData.bairro;
        addressDto.city = addressData.localidade;
        addressDto.state = addressData.uf as any;
        addressDto.zipCode = addressData.cep.replace('-', '');

        return addressDto;
    }

}