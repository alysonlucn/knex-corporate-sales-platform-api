import { Response, NextFunction } from 'express';
import { AppError } from '../../../shared/errors/AppError';
import { AppDataSource } from '../../../shared/infra/typeorm';
import { AuthRequest } from './AuthMiddleware';

export const ensureCompanyOwnership = (entityType: any, paramKey: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'User not authenticated');
    }

    const entityId = req.params[paramKey];

    if (!entityId) {
      throw new AppError(400, `Missing parameter: ${paramKey}`);
    }

    const repository = AppDataSource.getRepository(entityType);
    const entity = await repository.findOne({
      where: { id: Number(entityId) },
      relations: ['company'],
    });

    if (!entity) {
      throw new AppError(404, `${entityType.name} not found`);
    }

    if (entity.company.id !== req.user.companyId) {
      throw new AppError(
        403,
        'You do not have permission to access this resource',
      );
    }

    (req as any).resource = entity;

    next();
  };
};
