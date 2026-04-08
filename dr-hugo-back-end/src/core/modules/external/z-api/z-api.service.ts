import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  ZApiCta,
  ZApiSendMessageInput,
  ZApiSendMessageResponse,
} from './dtos/z-api.dtos';
import { ZApiErrorCode } from './enums/z-api.enums';

@Injectable()
export class ZApiService {
  private readonly logger = new Logger(ZApiService.name);
  private readonly apiUrl: string;
  private readonly instanceId: string;
  private readonly token: string;
  private readonly clientToken: string;
  private readonly apiTimeout: number;
  private readonly appName: string;
  private readonly appVersion: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiUrl = this.configService.get<string>('zApi.apiUrl');
    this.instanceId = this.configService.get<string>('zApi.instanceId');
    this.token = this.configService.get<string>('zApi.token');
    this.clientToken = this.configService.get<string>('zApi.clientToken');
    this.apiTimeout = this.configService.get<number>('zApi.apiTimeout') ?? 5000;

    this.appName = this.configService.get<string>('application.name');
    this.appVersion = this.configService.get<string>('application.version');

    if (!this.apiUrl || !this.instanceId || !this.token) {
      this.logger.error(
        'Configuração Z-API ausente. Verifique ZAPI_API_URL, ZAPI_INSTANCE_ID e ZAPI_TOKEN.',
      );
    }
  }

  public async sendMessage(
    input: ZApiSendMessageInput,
  ): Promise<ZApiSendMessageResponse> {
    const { phone, message, options } = input;

    const hasCtas = !!options?.ctas?.length;

    const endpoint = hasCtas ? 'send-button-actions' : 'send-text';

    const url = `${this.apiUrl}/instances/${this.instanceId}/token/${this.token}/${endpoint}`;

    try {
      this.logger.log(
        `Enviando mensagem para ${phone} via Z-API (CTAs: ${hasCtas})`,
      );

      const payload = hasCtas
        ? this.buildCtaPayload(phone, message, options.ctas)
        : this.buildTextPayload(phone, message);

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'User-Agent': `${this.appName}/${this.appVersion}`,
            'Content-Type': 'application/json',
            'Client-Token': this.clientToken,
          },
          timeout: this.apiTimeout,
        }),
      );

      if (!response.data || response.status !== 200) {
        return {
          success: false,
          error: {
            status: 'ERROR',
            message: 'Resposta inválida da Z-API',
            code: ZApiErrorCode.INVALID_RESPONSE,
          },
        };
      }

      this.logger.log(`Mensagem enviada com sucesso para ${phone}`);

      return {
        success: true,
        data: {
          messageId: response.data?.messageId,
        },
      };
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem para ${phone}`,
        error instanceof Error ? error.message : String(error),
      );

      if (hasCtas) {
        this.logger.warn(`Fallback para envio de texto simples para ${phone}`);

        return this.sendMessage({
          phone,
          message: this.buildFallbackMessage(message, options?.ctas),
        });
      }

      let errorMessage = 'Erro ao enviar mensagem via Z-API';
      let errorCode: ZApiErrorCode | undefined;

      if (
        (error as any).code === 'ECONNABORTED' ||
        (error as any).code === 'ETIMEDOUT'
      ) {
        errorMessage = 'Timeout na Z-API';
        errorCode = ZApiErrorCode.TIMEOUT;
      } else if ((error as any).response?.status >= 500) {
        errorMessage = 'Z-API indisponível';
        errorCode = ZApiErrorCode.SERVICE_UNAVAILABLE;
      } else if ((error as any).response?.status === 401) {
        errorMessage = 'Não autorizado na Z-API';
        errorCode = ZApiErrorCode.UNAUTHORIZED;
      } else if ((error as any).response?.status === 400) {
        errorMessage = 'Requisição inválida para Z-API';
        errorCode = ZApiErrorCode.BAD_REQUEST;
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

  private buildTextPayload(phone: string, message: string) {
    return {
      phone,
      message,
    };
  }

  private buildCtaPayload(phone: string, message: string, ctas: ZApiCta[]) {
    return {
      phone,
      message,
      buttonActions: ctas.slice(0, 3).map((cta, index) => ({
        id: `${index + 1}`,
        type: cta.type,
        label: cta.label,
        url: cta.url,
        phone: cta.phone,
      })),
    };
  }

  private buildFallbackMessage(message: string, ctas?: ZApiCta[]): string {
    if (!ctas?.length) return message;

    const optionsText = ctas
      .map((cta, index) => `${index + 1} - ${cta.label}`)
      .join('\n');

    return `${message}\n\nEscolha uma opção:\n${optionsText}`;
  }
}
