import express from 'express';
import config from '../config/environment';
import pool from '../config/mysql';

const router = express.Router();

// GET / - Environment information
router.get('/', (req, res) => {
  res.json({
    message: 'TinderClone API Environment Info',
    environment: config.nodeEnv,
    api: {
      baseUrl: config.apiBaseUrl,
      version: config.apiVersion,
      prefix: config.apiPrefix,
      port: config.port,
      endpoints: {
        auth: `${config.apiPrefix}/auth`,
        users: `${config.apiPrefix}/users`,
        profile: `${config.apiPrefix}/profile`,
        requests: `${config.apiPrefix}/requests`,
        info: `${config.apiPrefix}/info`,
      }
    },
    database: {
      host: config.database.host,
      database: config.database.database,
      connectionLimit: config.database.connectionLimit,
    },
    cors: {
      frontendUrl: config.frontendUrl,
      enabled: config.corsEnabled,
    },
    security: {
      rateLimitEnabled: config.rateLimitEnabled,
      jwtExpiresIn: config.jwtExpiresIn,
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /health - Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /db-health - Database health check
router.get('/db-health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Test the connection with a simple query
    await connection.execute('SELECT 1 as test');
    
    connection.release();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /status - Detailed status
router.get('/status', (req, res) => {
  res.json({
    environment: config.nodeEnv,
    port: config.port,
    apiBaseUrl: config.apiBaseUrl,
    apiPrefix: config.apiPrefix,
    frontendUrl: config.frontendUrl,
    logLevel: config.logLevel,
    corsEnabled: config.corsEnabled,
    rateLimitEnabled: config.rateLimitEnabled,
    database: {
      host: config.database.host,
      database: config.database.database,
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

export default router; 