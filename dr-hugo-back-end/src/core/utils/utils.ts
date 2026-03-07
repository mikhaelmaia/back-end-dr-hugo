import { createHash } from 'node:crypto';

export const generateSixDigitCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateHash = (length: number): string => {
  return createHash('md5')
    .update(Math.random().toString(36).substring(2, length))
    .digest('hex');
};
