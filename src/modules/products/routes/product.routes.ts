import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { ensureAuthenticated } from '../../auth/middlewares/AuthMiddleware';
import { ensureCollaborator } from '../../auth/middlewares/ensureCollaborator';
import { ensureCompanyOwnership } from '../../auth/middlewares/ensureCompanyOwnership';
import { validate } from '../../../shared/middlewares/validate';
import {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
} from '../schemas/productSchema';
import { Product } from '../infra/typeorm/entities/Product';

const router = Router();
const productController = new ProductController();

router.post(
  '/',
  ensureAuthenticated,
  ensureCollaborator,
  validate(createProductSchema),
  (req, res) => productController.create(req, res),
);

router.get('/', ensureAuthenticated, validate(queryProductSchema), (req, res) =>
  productController.findAll(req, res),
);

router.get('/:id', ensureAuthenticated, (req, res) =>
  productController.findById(req, res),
);

router.put(
  '/:id',
  ensureAuthenticated,
  ensureCollaborator,
  ensureCompanyOwnership(Product, 'id'),
  validate(updateProductSchema),
  (req, res) => productController.update(req, res),
);

router.delete(
  '/:id',
  ensureAuthenticated,
  ensureCollaborator,
  ensureCompanyOwnership(Product, 'id'),
  (req, res) => productController.delete(req, res),
);

export default router;
