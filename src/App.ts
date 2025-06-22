import express from 'express';
import cookieParser from 'cookie-parser';
// import { connectDB } from './config/database'; // MongoDB - commented out
import pool from './config/mysql';
import cors from 'cors';
import config from './config/environment';

// Important as this will Middleware will help us use the JSON data in the request body
const app = express();

import authRouter from './Routes/authRouter';
import profileRouter from './Routes/profileRouter';
import requestsRouter from './Routes/requestsRouter';
import userRouter from './Routes/userRouter';
import environmentRouter from './Routes/environmentRouter';

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Environment-specific API routes
app.use(`${config.apiPrefix}/auth`, authRouter);
app.use(`${config.apiPrefix}/profile`, profileRouter);
app.use(`${config.apiPrefix}/requests`, requestsRouter);
app.use(`${config.apiPrefix}/users`, userRouter);
app.use(`${config.apiPrefix}/info`, environmentRouter);

// Root endpoint with environment info
app.get('/', (req, res) => {
  res.json({
    message: `TinderClone API - ${config.nodeEnv.toUpperCase()} Environment`,
    environment: config.nodeEnv,
    apiPrefix: config.apiPrefix,
    port: config.port,
    endpoints: {
      info: `${config.apiPrefix}/info`,
      health: `${config.apiPrefix}/info/health`,
      status: `${config.apiPrefix}/info/status`,
      auth: `${config.apiPrefix}/auth`,
      users: `${config.apiPrefix}/users`,
      profile: `${config.apiPrefix}/profile`,
      requests: `${config.apiPrefix}/requests`,
    },
    timestamp: new Date().toISOString(),
  });
});

// MongoDB connection - commented out
// connectDB()
//   .then(() => {
//     console.log("MongoDB connected...");
//     app.listen(config.port, () => {
//       console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
//     });
//   })
//   .catch((err) => {
//     console.log("MongoDB connection error: ", err);
//   });

// SQL Database connection
pool.getConnection()
  .then((connection) => {
    console.log("SQL Database connected...");
    connection.release();
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`📡 API Base URL: ${config.apiBaseUrl}`);
      console.log(`🔗 API Prefix: ${config.apiPrefix}`);
      console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
      console.log(`🗄️  Database: ${config.database.database} on ${config.database.host}`);
    });
  })
  .catch((err) => {
    console.log("SQL Database connection error: ", err);
  }); 