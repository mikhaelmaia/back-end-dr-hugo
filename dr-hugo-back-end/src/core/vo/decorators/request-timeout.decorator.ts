import { SetMetadata } from '@nestjs/common';

export const REQUEST_TIMEOUT_KEY = 'requestTimeout';

export const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
export const UPLOAD_REQUEST_TIMEOUT_MS = 300_000;

export const RequestTimeout = (milliseconds: number) =>
  SetMetadata(REQUEST_TIMEOUT_KEY, milliseconds);
