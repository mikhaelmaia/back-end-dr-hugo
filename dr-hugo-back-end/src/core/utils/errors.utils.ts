import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  GoneException,
  InternalServerErrorException,
  ServiceUnavailableException,
  HttpException,
} from '@nestjs/common';
import { ERRORS, ErrorDefinition, ErrorCode, ErrorName } from '../vo/consts/errors';

/**
 * Get error definition by error code
 * @param code The error code (e.g., 'E001')
 * @returns ErrorDefinition or undefined if not found
 */
export const getErrorByCode = (code: ErrorCode): ErrorDefinition => {
  const error = ERRORS[code];
  if (!error) {
    throw new InternalServerErrorException(`Error code '${code}' not found in error definitions`);
  }
  return error;
};

/**
 * Get error definition by error name
 * @param name The error name (e.g., 'EMPTY_EMAIL')
 * @returns ErrorDefinition or undefined if not found
 */
export const getErrorByName = (name: ErrorName): ErrorDefinition => {
  const error = Object.values(ERRORS).find(error => error.name === name);
  if (!error) {
    throw new InternalServerErrorException(`Error name '${name}' not found in error definitions`);
  }
  return error;
};

/**
 * Create a NestJS HttpException based on error code
 * @param code The error code
 * @param additionalMessage Optional additional message to append
 * @returns Appropriate NestJS HttpException
 */
export const createHttpExceptionFromErrorCode = (
  code: ErrorCode
): HttpException => {
  const error = getErrorByCode(code);

  return createHttpExceptionFromStatus(error.httpStatus, error);
};

/**
 * Create a NestJS HttpException based on error name
 * @param name The error name
 * @param additionalMessage Optional additional message to append
 * @returns Appropriate NestJS HttpException
 */
export const createHttpExceptionFromErrorName = (
  name: ErrorName
): HttpException => {
  const error = getErrorByName(name);
  
  return createHttpExceptionFromStatus(error.httpStatus, error);
};

/**
 * Create appropriate NestJS HttpException based on HTTP status code
 * @param status HTTP status code
 * @param message Error message
 * @param errorCode Optional error code for context
 * @returns Appropriate NestJS HttpException
 */
export const createHttpExceptionFromStatus = (
  status: number,
  error: ErrorDefinition
): HttpException => {
  switch (status) {
    case 400:
      return new BadRequestException(error);
    case 401:
      return new UnauthorizedException(error);
    case 403:
      return new ForbiddenException(error);
    case 404:
      return new NotFoundException(error);
    case 409:
      return new ConflictException(error);
    case 410:
      return new GoneException(error);
    case 500:
      return new InternalServerErrorException(error);
    case 503:
      return new ServiceUnavailableException(error);
    default:
      return new HttpException(error, status);
  }
};

/**
 * Validate if an error code exists
 * @param code The error code to validate
 * @returns boolean
 */
export const isValidErrorCode = (code: string): code is ErrorCode => {
  return code in ERRORS;
};

/**
 * Validate if an error name exists
 * @param name The error name to validate
 * @returns boolean
 */
export const isValidErrorName = (name: string): name is ErrorName => {
  return Object.values(ERRORS).some(error => error.name === name);
};

/**
 * Get all errors by HTTP status code
 * @param status HTTP status code
 * @returns Array of ErrorDefinition
 */
export const getErrorsByStatus = (status: number): ErrorDefinition[] => {
  return Object.values(ERRORS).filter(error => error.httpStatus === status);
};

/**
 * Get errors grouped by HTTP status code
 * @returns Record of status code to ErrorDefinition array
 */
export const getErrorsGroupedByStatus = (): Record<number, ErrorDefinition[]> => {
  return Object.values(ERRORS).reduce((acc, error) => {
    if (!acc[error.httpStatus]) {
      acc[error.httpStatus] = [];
    }
    acc[error.httpStatus].push(error);
    return acc;
  }, {} as Record<number, ErrorDefinition[]>);
};

/**
 * Create error response object for API responses
 * @param code Error code
 * @param additionalMessage Optional additional message
 * @returns Object with error details
 */
export const createErrorResponse = (
  code: ErrorCode,
  additionalMessage?: string,
) => {
  const error = getErrorByCode(code);
  return {
    errorCode: error.code,
    errorName: error.name,
    message: additionalMessage ? `${error.message} ${additionalMessage}` : error.message,
    statusCode: error.httpStatus,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Utility function to throw error by code
 * @param code Error code
 * @param additionalMessage Optional additional message
 * @throws HttpException
 */
export const throwErrorByCode = (
  code: ErrorCode
): never => {
  throw createHttpExceptionFromErrorCode(code);
};

/**
 * Utility function to throw error by name
 * @param name Error name
 * @param additionalMessage Optional additional message
 * @throws HttpException
 */
export const throwErrorByName = (
  name: ErrorName
): never => {
  throw createHttpExceptionFromErrorName(name);
};

/**
 * Get error codes by category (based on code prefix)
 * @param prefix The prefix to filter by (e.g., 'E00' for E001-E009)
 * @returns Array of error codes matching the prefix
 */
export const getErrorCodesByPrefix = (prefix: string): ErrorCode[] => {
  return Object.keys(ERRORS).filter(code => code.startsWith(prefix)) as ErrorCode[];
};

/**
 * Check if an error is a validation error (4xx status)
 * @param code Error code
 * @returns boolean
 */
export const isValidationError = (code: ErrorCode): boolean => {
  const error = getErrorByCode(code);
  return error.httpStatus >= 400 && error.httpStatus < 500;
};

/**
 * Check if an error is a server error (5xx status)
 * @param code Error code
 * @returns boolean
 */
export const isServerError = (code: ErrorCode): boolean => {
  const error = getErrorByCode(code);
  return error.httpStatus >= 500;
};

/**
 * Get error statistics
 * @returns Object with error count by status code
 */
export const getErrorStatistics = () => {
  const errors = Object.values(ERRORS);
  const byStatus = errors.reduce((acc, error) => {
    acc[error.httpStatus] = (acc[error.httpStatus] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    total: errors.length,
    byStatus,
    validationErrors: errors.filter(e => e.httpStatus >= 400 && e.httpStatus < 500).length,
    serverErrors: errors.filter(e => e.httpStatus >= 500).length,
  };
};

/**
 * Create error from validation result
 * @param isValid Whether validation passed
 * @param errorCode Error code to throw if validation failed
 * @param additionalMessage Optional additional message
 */
export const validateOrThrow = (
  isValid: boolean,
  errorCode: ErrorCode,
): void => {
  if (!isValid) {
    throwErrorByCode(errorCode);
  }
};

/**
 * Create error from value existence check
 * @param value Value to check
 * @param errorCode Error code to throw if value is null/undefined
 * @param additionalMessage Optional additional message
 * @returns The value if it exists
 */
export const existsOrThrow = <T>(
  value: T | null | undefined,
  errorCode: ErrorCode,
): T => {
  if (value === null || value === undefined) {
    throwErrorByCode(errorCode);
  }
  return value;
};

/**
 * Wrapper for async operations that may throw errors
 * @param operation Async operation to execute
 * @param fallbackErrorCode Error code to use if operation throws unknown error
 * @returns Promise with the operation result
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallbackErrorCode: ErrorCode = 'E044', // DATABASE_ERROR as default
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throwErrorByCode(fallbackErrorCode);
  }
};

/**
 * Transform error code to HTTP exception for guards/interceptors
 * @param errorCode The error code to transform
 * @returns HttpException
 */
export const toHttpException = (errorCode: ErrorCode): HttpException => {
  return createHttpExceptionFromErrorCode(errorCode);
};
