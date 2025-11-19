import type { Request, Response, NextFunction } from 'express';

function deepTrim(value: any): any {
  if (typeof value === 'string') {
    const t = value.trim();
    return t;
  }
  if (Array.isArray(value)) {
    return value.map(deepTrim);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = deepTrim(v);
    }
    return out;
  }
  return value;
}

export function sanitize() {
  return function (req: Request, _res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      req.body = deepTrim(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = deepTrim(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = deepTrim(req.params);
    }
    next();
  };
}
