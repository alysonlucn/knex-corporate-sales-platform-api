import { Request, Response, NextFunction } from 'express';
import { Schema } from 'yup';
import { AppError } from '../errors/AppError';

export const validate = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error: any) {
      next(new AppError(400, error.message || 'Validation failed'));
    }
  };
};
