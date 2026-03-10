import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../shared/errors/AppError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    companyId: string | null;
  };
}

export const ensureAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError(401, 'Missing authorization token');
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    throw new AppError(401, 'Invalid token format');
  }

  const [scheme, token] = parts;

  if (scheme !== 'Bearer') {
    throw new AppError(401, 'Invalid token scheme');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret',
    );
    req.user = decoded as any;
    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
};
