import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  ViaCepAddress,
  ViaCepServiceResponse,
} from './dtos/viacep.dtos';
import { ViaCepErrorCode } from './enums/viacep.enums';

@Injectable()
export class ViaCepService {
  private readonly logger = new Logger(ViaCepService.name);
  private readonly apiUrl: string;
  private readonly apiTimeout: number;
  private readonly appName: string;
  private readonly appVersion: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl =
      this.configService.get<string>('viaCep.apiUrl');
    this.apiTimeout =
      this.configService.get<number>('viaCep.apiTimeout') ?? 3000;
    this.appName = this.configService.get<string>('application.name');
    this.appVersion = this.configService.get<string>('application.version');

    if (!this.apiUrl) {
      this.logger.error(
        'Configuração ViaCEP ausente. Verifique VIACEP_API_URL.',
      );
    }
  }

  public async getAddressByCep(
    cep: string,
  ): Promise<ViaCepServiceResponse> {
    const url = `${this.apiUrl}/${cep}/json`;
    
    try {
      this.logger.log(`Consultando CEP ${cep} no ViaCEP`);

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': `${this.appName}/${this.appVersion}`,
            Accept: 'application/json',
          },
          timeout: this.apiTimeout,
        }),
      );

      if (response.data?.erro) {
        return {
          success: false,
          error: {
            status: 'ERROR',
            message: 'CEP não encontrado',
            code: ViaCepErrorCode.NOT_FOUND,
          },
        };
      }

      const addressData: ViaCepAddress = response.data;

      if (!addressData.cep || !addressData.uf) {
        return {
          success: false,
          error: {
            status: 'ERROR',
            message: 'Dados de endereço inválidos',
          },
        };
      }

      this.logger.log(
        `Endereço encontrado com sucesso para CEP ${cep}`,
      );

      return {
        success: true,
        addressData,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao consultar ViaCEP para CEP ${cep}`,
        error.message,
      );

      let errorMessage = 'Erro ao consultar ViaCEP';
      let errorCode: ViaCepErrorCode | undefined;

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout na consulta ao ViaCEP';
        errorCode = ViaCepErrorCode.TIMEOUT;
      } else if (error.response?.status >= 500) {
        errorMessage = 'Serviço ViaCEP indisponível';
        errorCode = ViaCepErrorCode.SERVICE_UNAVAILABLE;
      }

      return {
        success: false,
        error: {
          status: 'ERROR',
          message: errorMessage,
          code: errorCode,
        },
      };
    }
  }
}