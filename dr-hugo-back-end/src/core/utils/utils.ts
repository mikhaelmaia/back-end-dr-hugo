import { createHash } from 'node:crypto';

export const generateSixDigitCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateHash = (length: number): string => {
  return createHash('md5')
    .update(Math.random().toString(36).substring(2, length))
    .digest('hex');
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
