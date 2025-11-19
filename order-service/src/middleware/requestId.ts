import type { Request, Response, NextFunction } from 'express';

function randomId() {
  // Simple, fast unique id for tracing
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = (req.headers['x-request-id'] as string | undefined)?.trim();
  const id = incoming && incoming.length > 0 ? incoming : randomId();
  res.locals.traceId = id;
  res.setHeader('x-request-id', id);
  next();
}
