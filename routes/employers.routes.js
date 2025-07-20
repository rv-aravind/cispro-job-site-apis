import { Router } from 'express';
import employerController from '../controller/employer.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';    

const employerRouter = Router();


employerRouter.post('/company-profile/create', authenticate, authorize(['super-admin', 'employer', 'admin']), employerController.createCompanyProfile);


export default employerRouter;