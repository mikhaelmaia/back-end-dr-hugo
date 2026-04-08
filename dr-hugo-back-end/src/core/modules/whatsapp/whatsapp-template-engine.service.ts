import { Injectable } from '@nestjs/common';
import {
  WhatsAppReference,
  WhatsAppTemplateParamsMap,
} from './consts/whatsapp.consts';

@Injectable()
export class WhatsAppTemplateEngine {
  public buildMessage<T extends keyof WhatsAppTemplateParamsMap>(
    reference: WhatsAppReference<T>,
    params: WhatsAppTemplateParamsMap[T],
  ): string {
    switch (reference.key) {
      case 'PHONE_CHANGE_REQUEST':
        return this.buildPhoneChangeRequest(
          params as WhatsAppTemplateParamsMap['PHONE_CHANGE_REQUEST'],
        );

      case 'PHONE_CHANGED_WARNING':
        return this.buildPhoneChangedWarning(
          params as WhatsAppTemplateParamsMap['PHONE_CHANGED_WARNING'],
        );
      case 'INSTITUTION_ACCESS_GRANTED':
        return this.buildInstitutionAccessGranted(
          params as WhatsAppTemplateParamsMap['INSTITUTION_ACCESS_GRANTED'],
        );

      case 'DOCTOR_ACCESS_GRANTED':
        return this.buildDoctorAccessGranted(
          params as WhatsAppTemplateParamsMap['DOCTOR_ACCESS_GRANTED'],
        );
      default:
        throw new Error(
          `WhatsApp template não implementado para referência: ${reference.key}`,
        );
    }
  }

  private buildPhoneChangeRequest(
    params: WhatsAppTemplateParamsMap['PHONE_CHANGE_REQUEST'],
  ): string {
    return [
      '📱 *Alteração de telefone solicitada*',
      '',
      'Recebemos uma solicitação para alterar o telefone da sua conta.',
      '',
      'Se foi você, confirme a alteração clicando no botão abaixo.',
      '',
      `Ou acesse: ${params.confirmationUrl}`,
      '',
      'Se você não solicitou essa alteração, ignore esta mensagem.',
      '',
      '*Doutor Viu*',
    ].join('\n');
  }

  private buildPhoneChangedWarning(
    params: WhatsAppTemplateParamsMap['PHONE_CHANGED_WARNING'],
  ): string {
    return [
      '⚠️ *Seu telefone foi alterado*',
      '',
      `Seu número foi atualizado para: ${params.newPhone}`,
      '',
      'Se você não realizou essa alteração, entre em contato com o suporte imediatamente.',
      '',
      '*Doutor Viu*',
    ].join('\n');
  }

  private buildInstitutionAccessGranted(
    params: WhatsAppTemplateParamsMap['INSTITUTION_ACCESS_GRANTED'],
  ): string {
    return [
      '🏥 *Acesso liberado para instituição*',
      '',
      `Razão social: ${params.corporateName}`,
      `CNES: ${params.cnes}`,
      `CNPJ: ${params.cnpj}`,
      '',
      `Data da liberação: ${params.grantedAt}`,
      '',
      'Se você não reconhece essa ação, revogue o acesso imediatamente.',
      '',
      `Gerenciar acesso: ${params.accessUrl}`,
      '',
      '*Doutor Viu*',
    ].join('\n');
  }

  private buildDoctorAccessGranted(
    params: WhatsAppTemplateParamsMap['DOCTOR_ACCESS_GRANTED'],
  ): string {
    return [
      '👨‍⚕️ *Acesso liberado para médico*',
      '',
      `Nome: ${params.name}`,
      `CRM: ${params.crm}`,
      `UF: ${params.crmUf}`,
      '',
      `Data da liberação: ${params.grantedAt}`,
      '',
      'Se você não reconhece essa ação, revogue o acesso imediatamente.',
      '',
      `Gerenciar acesso: ${params.accessUrl}`,
      '',
      '*Doutor Viu*',
    ].join('\n');
  }
}
