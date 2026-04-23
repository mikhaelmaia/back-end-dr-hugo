import heicConvert from 'heic-convert';
import { MediaType } from '../vo/consts/enums';

const ALLOWED_PATIENT_DOCUMENT_MIME_TYPES = new Set([
  // Imagens
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
  'image/heif',

  // Documentos
  'application/pdf',
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'text/csv',
  'application/vnd.oasis.opendocument.spreadsheet', // ODS
  'application/vnd.ms-excel', // XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX

  // Compactados
  'application/zip',
  'application/x-zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-rar',
  'application/vnd.rar',
]);

export const isAllowedMimeType = (mimeType: string): boolean => {
  return ALLOWED_PATIENT_DOCUMENT_MIME_TYPES.has(mimeType);
};

export const isHeic = (mimeType: string): boolean =>
  mimeType === 'image/heic' || mimeType === 'image/heif';

export const convertHeicToJpeg = async (buffer: Buffer): Promise<Buffer> => {
  const outputBuffer = await heicConvert({
    buffer,
    format: 'JPEG',
    quality: 0.9,
  });

  return Buffer.from(outputBuffer);
};

export const buildExamMonth = (examDate: Date): string => {
  const year = examDate.getFullYear();
  const month = String(examDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getMediaContentType = (mediaType: MediaType): string => {
  const mimeTypeMap = {
    [MediaType.JPG]: 'image/jpeg',
    [MediaType.JPEG]: 'image/jpeg',
    [MediaType.PNG]: 'image/png',
    [MediaType.GIF]: 'image/gif',
    [MediaType.PDF]: 'application/pdf',
    [MediaType.DOC]: 'application/msword',
    [MediaType.DOCX]:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    [MediaType.XLS]: 'application/vnd.ms-excel',
    [MediaType.XLSX]:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    [MediaType.TXT]: 'text/plain',
    [MediaType.CSV]: 'text/csv',
    [MediaType.ODS]: 'application/vnd.oasis.opendocument.spreadsheet',
    [MediaType.ZIP]: 'application/zip',
    [MediaType.RAR]: 'application/x-rar-compressed',
  };

  return mimeTypeMap[mediaType] || 'application/octet-stream';
};

export const extractFilename = (file: Express.Multer.File): string => {
  return Buffer.from(file.originalname, 'latin1').toString('utf8');
};

export const extractFileTypeFromOriginalName = (
  originalName: string,
): string | null => {
  const parts = originalName.split('.');
  if (parts.length < 2) {
    return null;
  }
  return parts.pop()?.toLowerCase() || null;
};

export const getMediaTypeFromFile = (file: Express.Multer.File): MediaType => {
  const fileExtension = extractFileTypeFromOriginalName(file.originalname);
  const normalizedExtension = fileExtension.toUpperCase();

  if (Object.values(MediaType).includes(normalizedExtension as MediaType)) {
    return normalizedExtension as MediaType;
  }

  const mimeTypeMap: { [key: string]: MediaType } = {
    'image/jpeg': MediaType.JPEG,
    'image/jpg': MediaType.JPG,
    'image/png': MediaType.PNG,
    'image/gif': MediaType.GIF,
    'application/pdf': MediaType.PDF,
    'application/msword': MediaType.DOC,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      MediaType.DOCX,
    'application/vnd.ms-excel': MediaType.XLS,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      MediaType.XLSX,
    'application/vnd.ms-powerpoint': MediaType.PPT,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      MediaType.PPTX,
    'text/plain': MediaType.TXT,
    'text/html': MediaType.HTML,
    'application/zip': MediaType.ZIP,
    'application/x-zip': MediaType.ZIP,
    'application/x-zip-compressed': MediaType.ZIP,
    'application/x-rar-compressed': MediaType.RAR,
    'application/x-rar': MediaType.RAR,
    'application/vnd.rar': MediaType.RAR,
  };

  return mimeTypeMap[file.mimetype] || MediaType.TXT;
};
