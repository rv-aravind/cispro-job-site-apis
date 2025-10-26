// auth.routes.js
import { Router } from 'express';
import authentication from '../controller/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const authRouter = Router();

// Route for user signup
authRouter.post('/sign-up', authentication.signup);

// Route for user signin
authRouter.post('/sign-in', authentication.signin);

// Route for password reset request
authRouter.put('/reset-password', authenticate, authorize(['admin', 'employer', 'candidate']), authentication.changePassword);

// Route for user signout
authRouter.post('/sign-out', authenticate, authentication.signout);

// Request password reset (send token)
authRouter.post('/forgot-password', authentication.forgotPassword);

// Reset password using token (no authentication)
authRouter.post('/reset-password/:token', authentication.resetPasswordWithToken);

// optional: Admin or superadmin can reset any user's password
authRouter.put(
  '/admin/reset-user-password/:id',
  authentication.adminResetUserPassword
);



export default authRouter;