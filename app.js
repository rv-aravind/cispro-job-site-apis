import express, { urlencoded } from 'express';
// import cookieParser from 'cookie-parser';
import { PORT } from './config/env.js';
import connectToDatabase from './database/mongodb.js';
// import bodyParser from 'body-parser';

import authRouter from './routes/auth.routes.js';
import adminRouter from './routes/admin.routes.js';
import errorMiddleware from './middleware/errorHandler.js';


// const express = require('express');
const app = express();

// const body = bodyParser.json(urlencoded({ extended: true }));

// middleware
app.use(express.json()); // for parsing application/json
app.use(urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(cookieParser()); // for parsing cookies


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);

// common error handler middleware(global error handler)
app.use(errorMiddleware);


app.get('/', (req,res) => { res.json('Hello World!'); });

app.listen(PORT, async() => {
  console.log(`Server is running on port http://localhost:${PORT}`);

  await connectToDatabase();

});
 

export default app;