import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { ProductService } from '../services/ProductService';
import { ProductRepository } from '../infra/typeorm/repositories/ProductRepository';
import { UserRepository } from '../../users/infra/typeorm/repositories/UserRepository';
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

const productRepository = new ProductRepository();
const userRepository = new UserRepository();
const productService = new ProductService(productRepository, userRepository);
const productController = new ProductController(productService);

router.post(
  '/',
  ensureAuthenticated,
  ensureCollaborator,
  validate(createProductSchema),
  (req, res) => productController.create(req, res),
);

router.get(
  '/',
  ensureAuthenticated,
  validate(queryProductSchema, 'query'),
  (req, res) => productController.findAll(req, res),
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
