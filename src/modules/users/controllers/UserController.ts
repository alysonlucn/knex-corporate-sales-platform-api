import { Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../../auth/middlewares/AuthMiddleware';
import { AppError } from '../../../shared/errors/AppError';
import { ResponseHelper } from '../../../shared/helpers/response';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getProfile(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const user = await this.userService.findById(Number(userId));

    return ResponseHelper.success(res, user);
  }

  async listAll(req: AuthRequest, res: Response) {
    const { page = 1, limit = 10 } = req.query;

    const result = await this.userService.findAll(
      Number(limit),
      (Number(page) - 1) * Number(limit),
    );

    return ResponseHelper.success(res, result);
  }
}
