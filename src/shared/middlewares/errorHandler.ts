import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ResponseHelper } from '../helpers/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return ResponseHelper.error(res, err.statusCode, err.message);
  }

  // eslint-disable-next-line no-console
  console.error('Unexpected error:', err);
  return ResponseHelper.error(res, 500, 'Internal server error');
};
