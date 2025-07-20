// auth.routes.js
import { Router } from 'express';
import authentication from '../controller/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const authRouter = Router();

// Route for user signup
authRouter.post('/sign-up', authentication.signup);

// Route for user signin
authRouter.post('/sign-in', authentication.signin);

// Route for user signout
authRouter.post('/sign-out', authenticate, authentication.signout);

export default authRouter;