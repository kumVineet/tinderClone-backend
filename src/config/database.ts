/**
 * @deprecated This MongoDB database configuration is deprecated.
 * Use src/config/mysql.ts instead for SQL-based database management.
 * This file will be removed in a future update.
 */

import mongoose from 'mongoose';
import config from './environment';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri);
  } catch (error) {
    throw new Error(`MongoDB connection error: ${error}`);
  }
};

export { connectDB }; 