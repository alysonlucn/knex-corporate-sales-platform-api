import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { LoginService } from '../services/LoginService';
import { RegisterService } from '../services/RegisterService';
import { UserRepository } from '../../users/infra/typeorm/repositories/UserRepository';
import { CompanyRepository } from '../../companies/infra/typeorm/repositories/CompanyRepository';
import { validate } from '../../../shared/middlewares/validate';
import { registerSchema } from '../schemas/registerSchema';
import { loginSchema } from '../schemas/loginSchema';

const authRoutes = Router();

const userRepository = new UserRepository();
const companyRepository = new CompanyRepository();

const loginService = new LoginService(userRepository);
const registerService = new RegisterService(userRepository, companyRepository);
const authController = new AuthController(registerService, loginService);

authRoutes.post('/register', validate(registerSchema), (req, res, next) => {
  authController.register(req, res).catch((error) => next(error));
});

authRoutes.post('/login', validate(loginSchema), (req, res, next) => {
  authController.login(req, res).catch((error) => next(error));
});

export default authRoutes;
