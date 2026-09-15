export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INVALID_TRANSITION'
  | 'INTERNAL';

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INVALID_TRANSITION: 422,
  INTERNAL: 500,
};

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: string[];

  constructor(code: ErrorCode, message: string, details: string[] = []) {
    super(message);
    this.code = code;
    this.status = STATUS[code];
    this.details = details;
  }
}

export const badRequest = (message: string, details: string[] = []) =>
  new ApiError('VALIDATION_ERROR', message, details);
export const unauthorized = (message = 'Authentication required') => new ApiError('UNAUTHORIZED', message);
export const forbidden = (message = 'You do not have access to this resource') =>
  new ApiError('FORBIDDEN', message);
export const notFound = (message = 'Resource not found') => new ApiError('NOT_FOUND', message);
export const conflict = (message: string) => new ApiError('CONFLICT', message);
export const invalidTransition = (message: string) => new ApiError('INVALID_TRANSITION', message);
