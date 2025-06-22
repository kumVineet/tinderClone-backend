import mysql from 'mysql2/promise';
import config from './environment';

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  queueLimit: number;
}

const getDatabaseConfig = (): DatabaseConfig => {
  return config.database;
};

const createPool = () => {
  const dbConfig = getDatabaseConfig();
  
  return mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
  });
};

export { createPool, getDatabaseConfig };
export type { DatabaseConfig }; 