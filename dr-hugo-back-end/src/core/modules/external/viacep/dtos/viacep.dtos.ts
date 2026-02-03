import { BrazilianState } from 'src/core/vo/consts/enums';
import { ViaCepErrorCode } from '../enums/viacep.enums';

export interface ViaCepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: BrazilianState;
  ibge: string;
  gia?: string;
  ddd: string;
  siafi: string;
}

export interface ViaCepErrorDto {
  status: 'ERROR';
  message: string;
  code?: ViaCepErrorCode;
}

export interface ViaCepServiceResponse {
  success: boolean;
  addressData?: ViaCepAddress;
  error?: ViaCepErrorDto;
}
