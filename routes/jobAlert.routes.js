import { Router } from 'express';
import jobAlertController from '../controller/jobAlert.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const jobAlertRouter = Router();

// Create job alert
jobAlertRouter.post('/job-alerts', authenticate, authorize(['candidate']), jobAlertController.createJobAlert);

// Update job alert
jobAlertRouter.put('/job-alerts/:id', authenticate, authorize(['candidate']), jobAlertController.updateJobAlert);

// Delete job alert
jobAlertRouter.delete('/job-alerts/:id', authenticate, authorize(['candidate']), jobAlertController.deleteJobAlert);

// List job alerts
jobAlertRouter.get('/job-alerts', authenticate, authorize(['candidate']), jobAlertController.listJobAlerts);

export default jobAlertRouter;