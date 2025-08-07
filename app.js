import express, { urlencoded } from 'express';
// import cookieParser from 'cookie-parser';
import { PORT } from './config/env.js';
import connectToDatabase from './database/mongodb.js';
// import bodyParser from 'body-parser';

import authRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';
import errorMiddleware from './middleware/errorHandler.js';
import employerRouter from './routes/employers.routes.js';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';


// const express = require('express');
const app = express();

// const body = bodyParser.json(urlencoded({ extended: true }));

// Security middleware
// app.use(helmet());
// app.use(mongoSanitize());
app.use(express.json({ limit: '10kb' }));

// Serve static files
app.use(express.static('public'));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use('/api', limiter);

// middleware
app.use(express.json()); // for parsing application/json
app.use(urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(cookieParser()); // for parsing cookies


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/employer-dashboard', employerRouter);


// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// cassuing issue with 404
// // Handle 404
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`
//   });
// });

// common error handler middleware(global error handler)
app.use(errorMiddleware);


app.get('/', (req,res) => { res.json('Hello World!'); });

app.listen(PORT, async() => {
  console.log(`Server is running on port http://localhost:${PORT}`);

  await connectToDatabase();

});
 

export default app;