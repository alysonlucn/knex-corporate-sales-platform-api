import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ResponseHelper } from '../helpers/response';
import { Logger } from '../helpers/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return ResponseHelper.error(res, err.statusCode, err.message);
  }

  Logger.error('Unexpected error:', err);
  return ResponseHelper.error(res, 500, 'Internal server error');
};
