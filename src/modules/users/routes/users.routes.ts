import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../infra/typeorm/repositories/UserRepository';
import { ensureAuthenticated } from '../../auth/middlewares/AuthMiddleware';

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/me', ensureAuthenticated, (req, res) =>
  userController.getProfile(req, res),
);

router.get('/', ensureAuthenticated, (req, res) =>
  userController.listAll(req, res),
);

export default router;
