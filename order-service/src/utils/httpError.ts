export class HttpError extends Error {
  status: number;
  code: string | undefined;
  details?: unknown;

  constructor(
    status: number,
    message: string,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function httpError(
  status: number,
  code: string,
  message: string,
  details?: unknown
): HttpError {
  return new HttpError(status, message, code, details);
}

export const errors = {
  validation: (message = 'Invalid input', details?: unknown) =>
    httpError(400, 'ORD_400_VALIDATION', message, details),
  forbidden: (message = 'Forbidden') => httpError(403, 'ORD_403', message),
  notFound: (message = 'Not found') => httpError(404, 'ORD_404', message),
  conflict: (message = 'Conflict') => httpError(409, 'ORD_409', message),
  internal: (message = 'Internal server error', details?: unknown) =>
    httpError(500, 'ORD_500', message, details),
};
