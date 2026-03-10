import { Request, Response } from 'express';
import { RegisterService } from '../services/RegisterService';
import { LoginService } from '../services/LoginService';
import { ResponseHelper } from '../../../shared/helpers/response';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const registerService = new RegisterService();
    const user = await registerService.execute(req.body);
    ResponseHelper.success(res, user, 201);
  }

  async login(req: Request, res: Response): Promise<void> {
    const loginService = new LoginService();
    const result = await loginService.execute(req.body);
    ResponseHelper.success(res, result);
  }
}
