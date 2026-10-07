import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  CnesEstablishmentDto,
  CnesResponseDto,
} from './dtos/cnes-response.dto';

@Injectable()
export class CnesService {
  private readonly logger = new Logger(CnesService.name);
  private readonly apiUrl: string;
  private readonly apiTimeout: number;
  private readonly establishmentPath: string;
  private readonly appName: string;
  private readonly appVersion: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('cnes.apiUrl');
    this.apiTimeout = this.configService.get<number>('cnes.apiTimeout');
    this.establishmentPath = this.configService.get<string>(
      'cnes.establishmentPath',
    );
    this.appName = this.configService.get<string>('application.name');
    this.appVersion = this.configService.get<string>('application.version');

    if (!this.apiUrl || !this.establishmentPath) {
      this.logger.error(
        'As configurações de consulta CNES estão ausentes. Por favor, verifique as variáveis de ambiente CNES_API_URL e CNES_ESTABLISHMENT_PATH.',
      );
    }
  }

  public async getEstablishmentByCnes(
    cnesCode: string,
  ): Promise<CnesResponseDto> {
    const url = `${this.apiUrl}${this.establishmentPath}/${cnesCode}`;

    try {
      this.logger.log(`Consultando o código CNES ${cnesCode} na API do CNES`);

      const response: AxiosResponse<CnesEstablishmentDto> =
        await firstValueFrom(
          this.httpService.get(url, {
            headers: {
              'User-Agent': `${this.appName}/${this.appVersion}`,
              Accept: 'application/json',
            },
            timeout: this.apiTimeout,
          }),
        );

      const establishmentData = response.data;

      if (
        !establishmentData.codigo_cnes ||
        !establishmentData.nome_razao_social
      ) {
        this.logger.warn(
          `Dados do estabelecimento inválidos recebidos para o código CNES: ${cnesCode}`,
        );
        return {
          success: false,
          error: {
            status: 'ERROR',
            message: 'Dados do estabelecimento inválidos ou incompletos',
          },
        };
      }

      this.logger.log(
        `Dados do estabelecimento obtidos com sucesso: ${establishmentData.nome_razao_social}`,
      );
      return {
        success: true,
        establishmentData,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao consultar CNES para o código ${cnesCode}:`,
        error.message,
      );

      let errorMessage = 'Erro interno ao consultar dados do estabelecimento';
      let errorCode: string | undefined;

      if (error.response?.status === 429) {
        errorMessage =
          'Limite de consultas excedido. Tente novamente mais tarde.';
        errorCode = 'RATE_LIMIT';
      } else if (error.response?.status === 404) {
        errorMessage = 'Código CNES não encontrado';
        errorCode = 'NOT_FOUND';
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout na consulta ao CNES. Tente novamente.';
        errorCode = 'TIMEOUT';
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
