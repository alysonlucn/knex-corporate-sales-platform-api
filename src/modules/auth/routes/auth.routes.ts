import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../../../shared/middlewares/validate';
import { registerSchema } from '../schemas/registerSchema';
import { loginSchema } from '../schemas/loginSchema';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/register', validate(registerSchema), (req, res, next) => {
  authController.register(req, res).catch((error) => next(error));
});

authRoutes.post('/login', validate(loginSchema), (req, res, next) => {
  authController.login(req, res).catch((error) => next(error));
});

export default authRoutes;
