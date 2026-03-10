import { Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { AuthRequest } from './AuthMiddleware';

export const ensureCollaborator = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    throw new AppError(401, 'User not authenticated');
  }

  if (req.user.role !== 'collaborator') {
    throw new AppError(403, 'Only collaborators can access this resource');
  }

  next();
};
