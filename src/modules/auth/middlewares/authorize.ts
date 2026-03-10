import { Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { AuthRequest } from './AuthMiddleware';

export type Policy = (req: AuthRequest) => boolean | Promise<boolean>;

export const authorize = (...policies: Policy[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    for (const policy of policies) {
      const isAuthorized = await policy(req);

      if (!isAuthorized) {
        throw new AppError(403, 'Access denied');
      }
    }

    next();
  };
};

export const canCreateProduct = (req: AuthRequest) => {
  return req.user?.role === 'collaborator';
};

export const canEditProduct = (req: AuthRequest) => {
  return req.user?.role === 'collaborator';
};

export const canDeleteProduct = (req: AuthRequest) => {
  return req.user?.role === 'collaborator';
};

export const canBuyProduct = (req: AuthRequest) => {
  return req.user?.role === 'consumer' || req.user?.role === 'collaborator';
};

export const canManageCompany = (req: AuthRequest) => {
  return req.user?.role === 'admin' || req.user?.role === 'collaborator';
};
