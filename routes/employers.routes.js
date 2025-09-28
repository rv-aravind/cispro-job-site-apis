import { Router } from 'express';
import employerController from '../controller/employer.controller.js';
import employerApplicantsController from '../controller/employerApplicants.controller.js';
import jobsController from '../controller/jobs.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import companyUpload from '../utils/fileUpload.js';  
import normalizeBody from '../utils/normalizeBody.js';

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
employerRouter.post('/jobs/create', authenticate, authorize(['employer', 'admin', 'superadmin']), companyUpload, normalizeBody, jobsController.createJobPost);  //we have added companyUpload to handle file uploads for job posts and normalizeBody to handle FormData parsing

// Get all job posts (filtered by employer for non-superadmins)
employerRouter.get('/jobs/fetch-all', authenticate, authorize(['employer', 'admin', 'superadmin']),jobsController.getJobPosts);

// Get a single job post for editing
employerRouter.get('/jobs/fetch/:id',authenticate, authorize(['employer', 'admin', 'superadmin']),jobsController.getJobPost);

// Update a job post
employerRouter.put('/jobs/update/:id',authenticate, authorize(['employer', 'admin', 'superadmin']), companyUpload, normalizeBody, jobsController.updateJobPost);

// Delete a job post
employerRouter.delete('/jobs/delete/:id',authenticate, authorize(['employer', 'admin', 'superadmin']),jobsController.deleteJobPost);



// Get applicants for a specific job post

// Get all applicants for a specific job with filters
employerRouter.get('/applicants/:jobId', authenticate, authorize(['employer', 'admin', 'superadmin']), employerApplicantsController.getApplicantsByJob);

// Update applicant status (approve/reject)
employerRouter.put('/applicants/:applicationId/status', authenticate, authorize(['employer', 'admin', 'superadmin']), employerApplicantsController.updateApplicantStatus);

// Delete an application
employerRouter.delete('/applicants/delete/:applicationId', authenticate, authorize(['employer', 'admin', 'superadmin']), employerApplicantsController.deleteApplicant);

// View applicant details
employerRouter.get('/applicants/get/:applicationId', authenticate, authorize(['employer', 'admin', 'superadmin']), employerApplicantsController.viewApplicant);

// Bulk update applicant statuses
employerRouter.put('/applicants/bulk-status', authenticate, authorize(['employer', 'admin', 'superadmin']), employerApplicantsController.bulkUpdateStatus);

// Shortlist an applicant
employerRouter.put('/applicants/:applicationId/shortlist', authenticate, authorize(['employer', 'admin', 'superadmin']), employerApplicantsController.shortlistApplicant);

// Unshortlist an applicant
employerRouter.put('/applicants/:applicationId/unshortlist', authenticate, authorize(['employer', 'admin', 'superadmin']), employerApplicantsController.unshortlistApplicant);

// Get shortlisted resumes
employerRouter.get('/shortlisted-resumes', authenticate, authorize(['employer', 'admin', 'superadmin']), employerApplicantsController.getShortlistedResumes);

export default employerRouter;