import type express from 'express';

interface StandardErrorBody {
  message: string;
  code?: string;
  details?: unknown;
  traceId?: string;
}

export function errorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const code = typeof err?.code === 'string' ? err.code : undefined;
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  const traceId = res.locals.traceId as string | undefined;

  const body: StandardErrorBody = {
    message: err?.message || 'Error interno del servidor',
    ...(code && { code }),
    ...(err?.details && { details: err.details }),
    ...(traceId && { traceId }),
  };

  if (status >= 500) {
    // Log server errors with stack
    // eslint-disable-next-line no-console
    console.error('[UnhandledError]', { traceId, err });
  }

  // In dev, include minimal stack info via header (optional)
  if (isDev && err?.stack) {
    res.setHeader('x-error', 'stack');
  }

  res.status(status).json(body);
}
