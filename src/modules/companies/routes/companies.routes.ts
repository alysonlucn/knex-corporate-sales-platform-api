import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { validate } from '../../../shared/middlewares/validate';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../schemas/companySchema';
import { ensureAuthenticated } from '../../auth/middlewares/AuthMiddleware';

const companiesRoutes = Router();
const companyController = new CompanyController();

companiesRoutes.post(
  '/',
  ensureAuthenticated,
  validate(createCompanySchema),
  (req, res, next) => {
    companyController.create(req, res).catch((error) => next(error));
  },
);

companiesRoutes.get('/', ensureAuthenticated, (req, res, next) => {
  companyController.findAll(req, res).catch((error) => next(error));
});

companiesRoutes.get('/:id', ensureAuthenticated, (req, res, next) => {
  companyController.findById(req, res).catch((error) => next(error));
});

companiesRoutes.put(
  '/:id',
  ensureAuthenticated,
  validate(updateCompanySchema),
  (req, res, next) => {
    companyController.update(req, res).catch((error) => next(error));
  },
);

companiesRoutes.delete('/:id', ensureAuthenticated, (req, res, next) => {
  companyController.delete(req, res).catch((error) => next(error));
});

export default companiesRoutes;
