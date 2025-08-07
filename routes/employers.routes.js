import { Router } from 'express';
import employerController from '../controller/employer.controller.js';
import jobsController from '../controller/jobs.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import companyUpload from '../utils/fileUpload.js';  

const employerRouter = Router();


// Route to get all company profiles (accessible to admins and superadmins)
employerRouter.get('/company-profile/fetch-all',authenticate,authorize(['employer', 'admin', 'superadmin']),  employerController.getAllCompanyProfiles);
// Route to create a company profile
// Only authenticated employers can access this route
// Create company profile (with file upload)
employerRouter.post('/company-profile/create',authenticate,authorize(['employer', 'admin', 'superadmin']),companyUpload,employerController.createCompanyProfile);
// Update company profile (with file upload)
employerRouter.put( '/company-profile/update/:id',authenticate,authorize(['employer', 'admin', 'superadmin']), companyUpload,employerController.updateCompanyProfile);
// Get company profile
employerRouter.get('/company-profile/get/:id',authenticate,authorize(['employer', 'admin', 'superadmin']),employerController.getCompanyProfile);
// Delete company profile
employerRouter.delete('/company-profile/delete/:id',authenticate,authorize(['employer', 'admin', 'superadmin']),employerController.deleteCompanyProfile);


// post job

// Route to create a job post (accessible to employers, admins, and superadmins)
employerRouter.post('/jobs/create', authenticate, authorize(['employer', 'admin', 'superadmin']), jobsController.createJobPost);

// Get all job posts (filtered by employer for non-superadmins)
employerRouter.get('/jobs/fetch-all', authenticate, authorize(['employer', 'admin', 'superadmin']),jobsController.getJobPosts);

// Get a single job post for editing
employerRouter.get('/jobs/fetch/:id',authenticate, authorize(['employer', 'admin', 'superadmin']),jobsController.getJobPost);

// Update a job post
employerRouter.put('/jobs/update/:id',authenticate, authorize(['employer', 'admin', 'superadmin']), jobsController.updateJobPost);

// Delete a job post
employerRouter.delete('/jobs/delete/:id',authenticate, authorize(['employer', 'admin', 'superadmin']),jobsController.deleteJobPost);

export default employerRouter;