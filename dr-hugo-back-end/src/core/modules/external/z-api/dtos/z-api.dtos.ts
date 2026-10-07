import { ZApiErrorCode } from '../enums/z-api.enums';

export interface ZApiCta {
  type: 'URL' | 'CALL';
  label: string;
  url?: string;
  phone?: string;
}

export interface ZApiSendMessageOptions {
  ctas?: ZApiCta[];
}

export interface ZApiSendMessageInput {
  phone: string;
  message: string;
  options?: ZApiSendMessageOptions;
}

export interface ZApiSendMessageData {
  messageId?: string;
}

export interface ZApiErrorDto {
  status: 'ERROR';
  message: string;
  code?: ZApiErrorCode;
}

export interface ZApiSendMessageResponse {
  success: boolean;
  data?: ZApiSendMessageData;
  error?: ZApiErrorDto;
}
