import { Router } from "express";
import candidateController from "../controller/candidate.controller.js";
import candidateResumeController from '../controller/candidateResume.controller.js';
import { authenticate, authorize } from "../middleware/auth.js";
import candidateUpload from "../utils/candidateFileUpload.js"; 
import normalizeBody from '../utils/normalizeBody.js';

const candidateRouter = Router();

// Get all candidate profiles (accessible to admins and superadmins)
candidateRouter.get('/profile/fetch-all', authenticate, authorize(['admin', 'superadmin', 'candidate']), candidateController.getAllCandidateProfiles);

// Create candidate profile (with file upload)
candidateRouter.post('/profile/create', authenticate, authorize(['candidate']), candidateUpload, normalizeBody, candidateController.createCandidateProfile);

// Update candidate profile (with file upload)
candidateRouter.put('/profile/update/:id', authenticate, authorize(['candidate', 'superadmin']), candidateUpload, normalizeBody, candidateController.updateCandidateProfile);

// Get single candidate profile
candidateRouter.get('/profile/get/:id', authenticate, authorize(['candidate', 'superadmin']), candidateController.getCandidateProfile);

// Delete candidate profile
candidateRouter.delete('/profile/delete/:id', authenticate, authorize(['candidate', 'superadmin']), candidateController.deleteCandidateProfile);

// View all job posts (public for candidates)
candidateRouter.get('/jobs', candidateController.getAllJobPosts);

// Apply to a job (with optional resume upload)
candidateRouter.post('/jobs/apply/:jobId', authenticate, authorize(['candidate']), candidateUpload, candidateController.applyToJob);

// Save a job
candidateRouter.post('/jobs/save/:jobId', authenticate, authorize(['candidate']), candidateController.saveJob);

// get application status
candidateRouter.get('/applications/:applicationId/status', authenticate, authorize(['candidate']), candidateController.getApplicationStatus);

// Get applied jobs dashboard
candidateRouter.get('/applied-jobs/get', authenticate, authorize(['candidate']), candidateController.getAppliedJobs);

// Get saved jobs dashboard
candidateRouter.get('/saved-jobs/get', authenticate, authorize(['candidate']), candidateController.getSavedJobs);

// Delete applied job
candidateRouter.delete('/applied-jobs/:applicationId', authenticate, authorize(['candidate']), candidateController.deleteAppliedJob);

// Delete saved job
candidateRouter.delete('/jobs/saved-jobs/remove/:savedJobId', authenticate, authorize(['candidate']), candidateController.deleteSavedJob);


// Create resume
candidateRouter.post('/resumes/create', authenticate, authorize(['candidate']), candidateUpload, candidateResumeController.createResume);

// Update resume
candidateRouter.put('/resumes/update/:id', authenticate, authorize(['candidate']), candidateUpload, candidateResumeController.updateResume);

// List resumes
candidateRouter.get('/resumes/get-all', authenticate, authorize(['candidate']), candidateResumeController.listResumes);

// Get single resume
candidateRouter.get('/resumes/get/:id', authenticate, authorize(['candidate']), candidateResumeController.getResume);

// Delete resume
candidateRouter.delete('/resumes/delete/:id', authenticate, authorize(['candidate']), candidateResumeController.deleteResume);

// Generate PDF CV
candidateRouter.get('/resumes/:id/generate-pdf', authenticate, authorize(['candidate']), candidateResumeController.generatePDF);

export default candidateRouter;