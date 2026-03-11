import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { ensureAuthenticated } from '../../auth/middlewares/AuthMiddleware';

const router = Router();
const userController = new UserController();

router.get('/me', ensureAuthenticated, (req, res) =>
  userController.getProfile(req, res),
);

router.get('/', ensureAuthenticated, (req, res) =>
  userController.listAll(req, res),
);

export default router;
