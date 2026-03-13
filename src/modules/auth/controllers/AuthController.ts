import { Request, Response } from 'express';
import { RegisterService } from '../services/RegisterService';
import { LoginService } from '../services/LoginService';
import { ResponseHelper } from '../../../shared/helpers/response';

export class AuthController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly loginService: LoginService,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const user = await this.registerService.execute(req.body);
    ResponseHelper.success(res, user, 201);
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await this.loginService.execute(req.body);
    ResponseHelper.success(res, result);
  }
}
