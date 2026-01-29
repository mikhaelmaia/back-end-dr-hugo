import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from 'src/core/vo/decorators/public.decorator';
import { AddressService } from './address.service';
import { AddressPaths } from '../../vo/consts/paths';
import { AddressDto } from './dtos/address.dto';
import { ExceptionResponse } from 'src/core/config/exceptions/exception-response';

@ApiTags('Endereço')
@Public()
@Controller(AddressPaths.BASE)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get(AddressPaths.BY_ZIP_CODE)
  @ApiOperation({
    summary: 'Buscar endereço por CEP',
    description: 'Retorna informações completas de endereço baseado no CEP fornecido. Utiliza a API do ViaCEP para buscar os dados.'
  })
  @ApiParam({
    name: 'zipCode',
    description: 'CEP para busca do endereço (formato: 00000000 ou 00000-000)',
    example: '01234567',
    type: String
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Endereço encontrado com sucesso',
    type: AddressDto,
    schema: {
      example: {
        street: 'Rua das Flores',
        number: '',
        complement: '',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        country: 'Brasil'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'CEP inválido ou não encontrado',
    type: ExceptionResponse,
    schema: {
      example: {
        statusCode: 400,
        message: 'CEP não encontrado ou inválido',
        timestamp: '2026-01-28T10:00:00.000Z',
        path: '/address/zip-code/00000000'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor ao buscar o endereço',
    type: ExceptionResponse
  })
  public async getAddressByZipCode(@Param('zipCode') zipCode: string): Promise<AddressDto> {
    return this.addressService.getAddressByZipCode(zipCode);
  }
}
