import { Request, Response, NextFunction } from 'express';
import { Schema } from 'yup';
import { AppError } from '../errors/AppError';

type ValidationSource = 'body' | 'query' | 'params';

export const validate = (schema: Schema, source: ValidationSource = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req[source], { abortEarly: false });
      next();
    } catch (error: any) {
      next(new AppError(400, error.message || 'Validation failed'));
    }
  };
};
