import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  public async generateBase64(content: string): Promise<string> {
    return QRCode.toDataURL(content, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 6,
    });
  }
}
