import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { CompanyDto, ReceitaWsErrorDto, ReceitaWsResponseDto } from './dto/company.dto';

@Injectable()
export class ReceitaWsService {
  private readonly logger = new Logger(ReceitaWsService.name);
  private readonly apiUrl: string;
  private readonly apiTimeout: number;
  private readonly companyDataPath: string;
  private readonly appName: string;
  private readonly appVersion: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('receitaWs.apiUrl');
    this.apiTimeout = this.configService.get<number>('receitaWs.apiTimeout');
    this.companyDataPath = this.configService.get<string>('receitaWs.companyDataPath');
    this.appName = this.configService.get<string>('application.name');
    this.appVersion = this.configService.get<string>('application.version');
    
    if (!this.apiUrl || !this.companyDataPath) {
      this.logger.error('As configurações de consulta ReceitaWS estão ausentes. Por favor, verifique as variáveis de ambiente RECEITAWS_API_URL e RECEITAWS_COMPANY_DATA_PATH.');
    }
  }

  public async getCompanyByCnpj(cnpj: string): Promise<ReceitaWsResponseDto> {
    const url = `${this.apiUrl}${this.companyDataPath}/${cnpj}`;
    
    try {
      this.logger.log(`Consultando o CNPJ ${cnpj} na ReceitaWS`);
      
      const response: AxiosResponse<CompanyDto | ReceitaWsErrorDto> = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': `${this.appName}/${this.appVersion}`,
            'Accept': 'application/json',
          },
          timeout: this.apiTimeout,
        })
      );

      const data = response.data;

      if ('status' in data && data.status === 'ERROR') {
        const errorData = data as ReceitaWsErrorDto;
        this.logger.warn(`ReceitaWS retornou erro para o CNPJ ${cnpj}: ${errorData.message}`);
        return {
          success: false,
          error: errorData
        };
      }

      const companyData = data as CompanyDto;
      
      if (!companyData.cnpj || !companyData.nome) {
        this.logger.warn(`Dados da empresa inválidos recebidos para o CNPJ: ${cnpj}`);
        return {
          success: false,
          error: {
            status: 'ERROR',
            message: 'Dados da empresa inválidos ou incompletos'
          }
        };
      }

      this.logger.log(`Dados da empresa obtidos com sucesso: ${companyData.nome}`);
      return {
        success: true,
        companyData
      };
      
    } catch (error) {
      this.logger.error(`Erro ao consultar ReceitaWS para o CNPJ ${cnpj}:`, error.message);
      
      let errorMessage = 'Erro interno ao consultar dados da empresa';
      let errorCode: string | undefined;
      
      if (error.response?.status === 429) {
        errorMessage = 'Limite de consultas excedido. Tente novamente mais tarde.';
        errorCode = 'RATE_LIMIT';
      } else if (error.response?.status === 404) {
        errorMessage = 'CNPJ não encontrado';
        errorCode = 'NOT_FOUND';
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout na consulta ao ReceitaWS. Tente novamente.';
        errorCode = 'TIMEOUT';
      }
      
      return {
        success: false,
        error: {
          status: 'ERROR',
          message: errorMessage,
          code: errorCode
        }
      };
    }
  }
}