import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  CfmConsultRequest,
  CfmValidateRequest,
  CfmDoctorData,
  CfmValidationResult,
  CfmServiceResponse,
} from './dtos/cfm.dtos';
import { DoctorRegistrationType, DoctorSituation } from 'src/core/vo/consts/enums';

@Injectable()
export class CfmService {
  private readonly logger = new Logger(CfmService.name);
  private readonly apiUrl: string;
  private readonly apiTimeout: number;
  private readonly appName: string;
  private readonly appVersion: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('cfm.apiUrl');
    this.apiTimeout = this.configService.get<number>('cfm.apiTimeout') ?? 5000;
    this.appName = this.configService.get<string>('application.name');
    this.appVersion = this.configService.get<string>('application.version');

    if (!this.apiUrl) {
      this.logger.error(
        'Configuração CFM ausente. Verifique CFM_API_URL.',
      );
    }
  }

  public async consultDoctor(
    request: CfmConsultRequest,
  ): Promise<CfmServiceResponse<CfmDoctorData>> {
    return {
      success: true,
      doctorData: {
        nome: 'Dr. João Silva',
        crm: 123456,
        uf: 'SP',
        situacao: DoctorSituation.REGULAR,
        tipoInscricao: DoctorRegistrationType.PRINCIPAL,
        especialidades: ['Cardiologia', 'Pediatria'],
        dataAtualizacao: '2023-06-01',
      }
    };
    const soapEnvelope = this.buildConsultSoapEnvelope(request);

    try {
      this.logger.log(
        `Consultando médico CRM ${request.crm}/${request.uf}`,
      );

      const response: AxiosResponse<string> = await firstValueFrom(
        this.httpService.post(this.apiUrl, soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'User-Agent': `${this.appName}/${this.appVersion}`,
          },
          timeout: this.apiTimeout,
        }),
      );

      const doctorData = this.parseConsultResponse(response.data);

      if (!doctorData) {
        return {
          success: false,
          error: {
            status: 'ERROR',
            message: 'Médico não encontrado',
            code: 'NOT_FOUND',
          },
        };
      }

      return {
        success: true,
        doctorData,
      };
    } catch (error) {
      return this.handleError(error, 'Erro ao consultar médico no CFM');
    }
  }

  public async validateDoctor(
    request: CfmValidateRequest,
  ): Promise<CfmServiceResponse<CfmValidationResult>> {
    const soapEnvelope = this.buildValidateSoapEnvelope(request);

    try {
      this.logger.log(
        `Validando médico CRM ${request.crm}/${request.uf}`,
      );

      const response: AxiosResponse<string> = await firstValueFrom(
        this.httpService.post(this.apiUrl, soapEnvelope, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'User-Agent': `${this.appName}/${this.appVersion}`,
          },
          timeout: this.apiTimeout,
        }),
      );

      const isValid = this.parseValidateResponse(response.data);

      return {
        success: true,
        doctorData: {
          valido: isValid,
        },
      };
    } catch (error) {
      return this.handleError(error, 'Erro ao validar médico no CFM');
    }
  }

  private buildConsultSoapEnvelope({
    crm,
    uf,
    chave,
  }: CfmConsultRequest): string {
    return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                        xmlns:ser="http://servico.cfm.org.br/">
        <soapenv:Header/>
        <soapenv:Body>
          <ser:Consultar>
            <crm>${crm}</crm>
            <uf>${uf}</uf>
            <chave>${chave}</chave>
          </ser:Consultar>
        </soapenv:Body>
      </soapenv:Envelope>
    `.trim();
  }

  private buildValidateSoapEnvelope({
    crm,
    uf,
    cpf,
    dataNascimento,
    chave,
  }: CfmValidateRequest): string {
    return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                        xmlns:ser="http://servico.cfm.org.br/">
        <soapenv:Header/>
        <soapenv:Body>
          <ser:Validar>
            <crm>${crm}</crm>
            <uf>${uf}</uf>
            <cpf>${cpf}</cpf>
            <dataNascimento>${dataNascimento}</dataNascimento>
            <chave>${chave}</chave>
          </ser:Validar>
        </soapenv:Body>
      </soapenv:Envelope>
    `.trim();
  }

  private parseConsultResponse(xml: string): CfmDoctorData | null {
    try {
      const getValue = (tag: string): string | null => {
        const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`));
        return match?.[1] ?? null;
      };

      const nome = getValue('nome');
      const crm = getValue('crm');
      const uf = getValue('uf');

      if (!nome || !crm || !uf) return null;

      const especialidades =
        xml.match(/<especialidade>(.*?)<\/especialidade>/g)?.map(
          (e) => e.replace(/<\/?especialidade>/g, ''),
        ) ?? [];

      return {
        nome,
        crm: Number(crm),
        uf,
        situacao: getValue('situacao') as any,
        tipoInscricao: getValue('tipoInscricao') as any,
        especialidades,
        dataAtualizacao: getValue('dataAtualizacao'),
      };
    } catch {
      return null;
    }
  }

  private parseValidateResponse(xml: string): boolean {
    const match = xml.match(/<(true|false)>/i);
    return match?.[1]?.toLowerCase() === 'true';
  }

  private handleError(
    error: any,
    defaultMessage: string,
  ): CfmServiceResponse<any> {
    this.logger.error(defaultMessage, error.message);

    let errorMessage = defaultMessage;
    let errorCode: string | undefined;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Timeout na comunicação com o CFM';
      errorCode = 'TIMEOUT';
    } else if (error.response?.status === 500) {
      errorMessage = 'Erro interno no WebService do CFM';
      errorCode = 'CFM_INTERNAL_ERROR';
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