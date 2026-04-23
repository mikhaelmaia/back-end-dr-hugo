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
      case 'PATIENT_DOCTOR_GRANT':
        return this.buildPatientDoctorGrant(
          params as WhatsAppTemplateParamsMap['PATIENT_DOCTOR_GRANT'],
        );
      case 'PATIENT_INSTITUTION_GRANT':
        return this.buildPatientInstitutionGrant(
          params as WhatsAppTemplateParamsMap['PATIENT_INSTITUTION_GRANT'],
        );
      case 'PATIENT_DOCUMENT_UPLOADED':
        return this.buildPatientDocumentUploaded(
          params as WhatsAppTemplateParamsMap['PATIENT_DOCUMENT_UPLOADED'],
        );
      case 'DOCTOR_RECEIVE_PATIENT_GRANT':
        return this.buildDoctorReceivePatientGrant(
          params as WhatsAppTemplateParamsMap['DOCTOR_RECEIVE_PATIENT_GRANT'],
        );
      case 'INSTITUTION_RECEIVE_PATIENT_GRANT':
        return this.buildInstitutionReceivePatientGrant(
          params as WhatsAppTemplateParamsMap['INSTITUTION_RECEIVE_PATIENT_GRANT'],
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

  private buildPatientDoctorGrant(
    params: WhatsAppTemplateParamsMap['PATIENT_DOCTOR_GRANT'],
  ): string {
    const accessLine = params.persistent
      ? `O médico *${params.doctorName}* agora tem acesso contínuo aos seus documentos, dados e ficha médica na plataforma Doutor Viu. Isto inclui documentos que você cadastrar futuramente.`
      : `O médico *${params.doctorName}* agora tem acesso aos documentos que você selecionou, aos seus dados e à sua ficha médica cadastrados na plataforma Doutor Viu.`;

    return [
      '👨‍⚕️ *Doutor Viu - Novo acesso autorizado*',
      '',
      `Olá, ${params.patientName}! Tudo bem?`,
      '',
      accessLine,
      '',
      `📅 Data: ${params.grantedAt}`,
      '',
      'Caso não reconheça este acesso ou queira revogar a permissão, utilize os botões abaixo.',
      '',
      'Qualquer dúvida, estamos por aqui!',
      '',
      'Equipe Doutor Viu',
    ].join('\n');
  }

  private buildPatientInstitutionGrant(
    params: WhatsAppTemplateParamsMap['PATIENT_INSTITUTION_GRANT'],
  ): string {
    const accessLine = params.persistent
      ? `A instituição *${params.institutionName}* agora tem acesso contínuo à sua conta e pode subir documentos e visualizar seus dados na plataforma Doutor Viu a qualquer momento.`
      : `A instituição *${params.institutionName}* acabou de se vincular à sua conta e pode subir documentos e visualizar seus dados na plataforma Doutor Viu por até 15 dias.`;

    return [
      '🏥 *Doutor Viu - Novo acesso autorizado*',
      '',
      `Olá, ${params.patientName}! Tudo bem?`,
      '',
      accessLine,
      '',
      `📅 Data: ${params.grantedAt}`,
      '',
      'Caso não reconheça este acesso ou queira revogar a permissão, utilize os botões abaixo.',
      '',
      'Qualquer dúvida, estamos por aqui!',
      '',
      'Equipe Doutor Viu',
    ].join('\n');
  }

  private buildPatientDocumentUploaded(
    params: WhatsAppTemplateParamsMap['PATIENT_DOCUMENT_UPLOADED'],
  ): string {
    return [
      '🏥 *Doutor Viu - Novo documento adicionado*',
      '',
      `Olá, ${params.patientName}! Tudo bem?`,
      '',
      `A instituição *${params.institutionName}* adicionou um novo documento na sua conta na plataforma Doutor Viu.`,
      '',
      `📅 Data: ${params.uploadedAt}`,
      '',
      'Para visualizar o documento, utilize o botão abaixo.',
      '',
      'Qualquer dúvida, estamos por aqui!',
      '',
      'Equipe Doutor Viu',
    ].join('\n');
  }

  private buildDoctorReceivePatientGrant(
    params: WhatsAppTemplateParamsMap['DOCTOR_RECEIVE_PATIENT_GRANT'],
  ): string {
    const accessLine = params.persistent
      ? `Você agora tem acesso contínuo aos documentos que o paciente *${params.patientName}* selecionou, aos dados dele e à ficha médica dele cadastrados na plataforma Doutor Viu. Isto inclui os documentos que o paciente cadastrar futuramente na plataforma.`
      : `Você agora tem acesso aos documentos que o paciente *${params.patientName}* selecionou, aos dados dele e à ficha médica dele cadastrados na plataforma Doutor Viu.`;

    return [
      '👨‍⚕️ *Doutor Viu - Novo acesso autorizado*',
      '',
      `Olá, ${params.doctorName}! Tudo bem?`,
      '',
      accessLine,
      '',
      `📅 Data: ${params.grantedAt}`,
      '',
      'Caso não reconheça este acesso ou queira revogar a permissão, utilize os botões abaixo.',
      '',
      'Qualquer dúvida, estamos por aqui!',
      '',
      'Equipe Doutor Viu',
    ].join('\n');
  }

  private buildInstitutionReceivePatientGrant(
    params: WhatsAppTemplateParamsMap['INSTITUTION_RECEIVE_PATIENT_GRANT'],
  ): string {
    const accessLine = params.persistent
      ? `Você agora tem acesso contínuo à conta do paciente *${params.patientName}*, podendo subir documentos dele na plataforma Doutor Viu a qualquer momento.`
      : `Você agora tem acesso à conta do paciente *${params.patientName}*, podendo subir documentos dele na plataforma Doutor Viu por até 15 dias.`;

    return [
      '🏥 *Doutor Viu - Novo vínculo realizado*',
      '',
      `Olá, ${params.institutionName}! Tudo bem?`,
      '',
      accessLine,
      '',
      `📅 Data: ${params.grantedAt}`,
      '',
      'Caso não reconheça este acesso ou queira revogar a permissão, utilize os botões abaixo.',
      '',
      'Qualquer dúvida, estamos por aqui!',
      '',
      'Equipe Doutor Viu',
    ].join('\n');
  }
}
