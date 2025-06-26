#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Load environment-specific configuration
const args = process.argv.slice(2);
const action = args[0];
const environment = args[1] || process.env.NODE_ENV || 'development';

// Load the appropriate environment file
const envFile = `.env.${environment}`;
require('dotenv').config({ path: envFile });

class DatabaseManager {
  constructor() {
    this.environments = ['development', 'staging', 'production'];
  }

  // Get database configuration for an environment
  getDatabaseConfig(environment) {
    switch (environment) {
      case 'development':
        return {
          host: process.env.DEV_MYSQL_HOST,
          user: process.env.DEV_MYSQL_USER,
          password: process.env.DEV_MYSQL_PASSWORD,
          database: process.env.DEV_MYSQL_DATABASE || 'tinderClone_dev',
          connectionLimit: parseInt(process.env.DEV_MYSQL_CONNECTION_LIMIT || '10'),
          queueLimit: parseInt(process.env.DEV_MYSQL_QUEUE_LIMIT || '0'),
          waitForConnections: true,
          charset: 'utf8mb4',
        };
      case 'staging':
        return {
          host: process.env.STAGING_MYSQL_HOST,
          user: process.env.STAGING_MYSQL_USER,
          password: process.env.STAGING_MYSQL_PASSWORD,
          database: process.env.STAGING_MYSQL_DATABASE || 'tinderClone_staging',
        };
      case 'production':
        return {
          host: process.env.PRODUCTION_MYSQL_HOST,
          user: process.env.PRODUCTION_MYSQL_USER,
          password: process.env.PRODUCTION_MYSQL_PASSWORD,
          database: process.env.PRODUCTION_MYSQL_DATABASE || 'tinderClone_prod',
        };
      default:
        throw new Error(`Unknown environment: ${environment}`);
    }
  }

  // Create database and tables for an environment
  async setupDatabase(environment) {
    console.log(`🏗️  Setting up ${environment} database...`);
    
    const config = this.getDatabaseConfig(environment);
    
    if (!config.host || !config.user) {
      console.error(`❌ Missing ${environment} database configuration`);
      return false;
    }

    let connection;
    
    try {
      // Connect without specifying database
      connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
      });

      console.log(`✅ Connected to ${environment} MySQL server`);

      // Create database
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
      console.log(`✅ Database '${config.database}' created/verified`);

      // Close connection and reconnect to specific database
      await connection.end();
      connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
      });

      console.log(`✅ Connected to '${config.database}' database`);

      // Read and execute SQL setup script
      const sqlScriptPath = path.join(__dirname, 'setupDatabase.sql');
      const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');

      // Clean the script (remove CREATE DATABASE and USE statements)
      const cleanScript = sqlScript
        .replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '')
        .replace(/USE.*?;/gi, '')
        .replace(/--.*$/gm, '')
        .trim();

      if (cleanScript) {
        // Split the script into individual statements
        const statements = cleanScript
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);

        // Execute each statement separately
        for (const statement of statements) {
          if (statement.trim()) {
            await connection.query(statement);
          }
        }
        console.log(`✅ Tables created in ${config.database}`);
      }

      await connection.end();
      console.log(`✅ ${environment} database setup completed successfully!`);
      return true;

    } catch (error) {
      console.error(`❌ Error setting up ${environment} database:`, error.message);
      if (connection) await connection.end();
      return false;
    }
  }

  // Clone data from RDS to local
  async cloneToLocal(sourceEnvironment) {
    console.log(`🔄 Cloning ${sourceEnvironment} database to development...`);

    const sourceConfig = this.getDatabaseConfig(sourceEnvironment);
    const devConfig = this.getDatabaseConfig('development');

    let sourceConn, devConn;

    try {
      // Connect to source database
      sourceConn = await mysql.createConnection({
        host: sourceConfig.host,
        user: sourceConfig.user,
        password: sourceConfig.password,
        database: sourceConfig.database,
      });

      // Connect to development database
      devConn = await mysql.createConnection({
        host: devConfig.host,
        user: devConfig.user,
        password: devConfig.password,
        database: devConfig.database,
      });

      console.log(`✅ Connected to source: ${sourceConfig.database}`);
      console.log(`✅ Connected to development: ${devConfig.database}`);

      // Get all tables from source
      const [tables] = await sourceConn.execute('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);

      console.log(`📋 Found ${tableNames.length} tables to clone: ${tableNames.join(', ')}`);

      for (const tableName of tableNames) {
        try {
          // Get data from source
          const [rows] = await sourceConn.execute(`SELECT * FROM ${tableName}`);

          if (rows.length === 0) {
            console.log(`⚠️  Table ${tableName} is empty, skipping...`);
            continue;
          }

          console.log(`📊 Cloning ${rows.length} rows from ${tableName}...`);

          // Clear development table
          await devConn.execute(`DELETE FROM ${tableName}`);

          // Insert data into development
          if (rows.length > 0) {
            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(',');
            const insertQuery = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;

            for (const row of rows) {
              const values = columns.map(col => row[col]);
              await devConn.execute(insertQuery, values);
            }
          }

          console.log(`✅ Cloned ${rows.length} rows to ${tableName}`);

        } catch (error) {
          console.warn(`⚠️  Error cloning table ${tableName}: ${error.message}`);
        }
      }

      await sourceConn.end();
      await devConn.end();

      console.log(`✅ Database clone from ${sourceEnvironment} to development completed successfully!`);
      return true;

    } catch (error) {
      console.error(`❌ Error cloning database:`, error.message);
      if (sourceConn) await sourceConn.end();
      if (devConn) await devConn.end();
      return false;
    }
  }

  // Test database connection
  async testConnection(environment) {
    console.log(`🧪 Testing ${environment} database connection...`);

    const config = this.getDatabaseConfig(environment);

    try {
      const connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
      });

      console.log(`✅ Successfully connected to ${environment} database`);

      // Test basic queries
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`✅ Found ${tables.length} tables:`, tables.map(row => Object.values(row)[0]));

      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Users table has ${users[0].count} records`);

      await connection.end();
      console.log(`✅ ${environment} database connection test passed!`);
      return true;

    } catch (error) {
      console.error(`❌ ${environment} database connection test failed:`, error.message);
      return false;
    }
  }

  // Setup all environments
  async setupAll() {
    console.log('🚀 Setting up all database environments...\n');

    for (const env of this.environments) {
      // Spawn a new process for each environment
      const result = spawnSync(
        process.execPath,
        [__filename, 'setup', env],
        { stdio: 'inherit' }
      );
      if (result.status === 0) {
        console.log(`✅ ${env} database ready\n`);
      } else {
        console.log(`❌ ${env} database setup failed\n`);
      }
    }
  }

  // Test all environments
  async testAll() {
    console.log('🧪 Testing all database connections...\n');

    for (const env of this.environments) {
      const success = await this.testConnection(env);
      if (success) {
        console.log(`✅ ${env} connection test passed\n`);
      } else {
        console.log(`❌ ${env} connection test failed\n`);
      }
    }
  }
}

// Test database connectivity
async function testDatabaseConnection() {
  console.log('🔍 Testing database connectivity...');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Database: ${dbConfig.database}`);
  console.log(`User: ${dbConfig.user}`);
  
  const pool = mysql.createPool(dbConfig);
  
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Query test successful:', rows[0]);
    
    // Test users table
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users table accessible: ${userCount[0].count} users found`);
    
    connection.release();
    await pool.end();
    
    console.log('✅ All database tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('ECONNRESET')) {
      console.error('💡 This appears to be a connection reset error. Possible causes:');
      console.error('   - Database server is down or restarting');
      console.error('   - Network connectivity issues');
      console.error('   - Firewall blocking connections');
      console.error('   - Database connection limit reached');
    }
    
    if (error.message.includes('Access denied')) {
      console.error('💡 Authentication failed. Check your database credentials.');
    }
    
    if (error.message.includes('Unknown database')) {
      console.error('💡 Database does not exist. Run the setup script first.');
    }
    
    await pool.end();
    return false;
  }
}

// Monitor database connections
async function monitorConnections() {
  console.log('📊 Monitoring database connections...');
  
  const pool = mysql.createPool(dbConfig);
  let successCount = 0;
  let failureCount = 0;
  
  const testInterval = setInterval(async () => {
    try {
      const connection = await pool.getConnection();
      await connection.execute('SELECT 1');
      connection.release();
      successCount++;
      process.stdout.write(`\r✅ Successful connections: ${successCount}, ❌ Failed: ${failureCount}`);
    } catch (error) {
      failureCount++;
      console.error(`\n❌ Connection failed (${failureCount}):`, error.message);
    }
  }, 5000); // Test every 5 seconds
  
  // Stop monitoring after 2 minutes
  setTimeout(() => {
    clearInterval(testInterval);
    pool.end();
    console.log('\n📊 Monitoring completed.');
    console.log(`Total successful: ${successCount}, Total failed: ${failureCount}`);
  }, 120000);
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const environment = process.argv[3];

  const manager = new DatabaseManager();

  switch (command) {
    case 'setup':
      if (environment && manager.environments.includes(environment)) {
        await manager.setupDatabase(environment);
      } else if (environment === 'all') {
        await manager.setupAll();
      } else {
        console.log('Usage: node databaseManager.js setup [development|staging|production|all]');
      }
      break;

    case 'test':
      if (environment && manager.environments.includes(environment)) {
        await manager.testConnection(environment);
      } else if (environment === 'all') {
        await manager.testAll();
      } else {
        console.log('Usage: node databaseManager.js test [development|staging|production|all]');
      }
      break;

    case 'clone':
      if (environment && ['staging', 'production'].includes(environment)) {
        await manager.cloneToLocal(environment);
      } else {
        console.log('Usage: node databaseManager.js clone [staging|production]');
      }
      break;

    case 'testdb':
      await testDatabaseConnection();
      break;

    case 'monitor':
      await monitorConnections();
      break;

    default:
      console.log('Database Manager Commands:');
      console.log('  setup [env|all]     - Setup database for environment(s)');
      console.log('  test [env|all]      - Test database connection(s)');
      console.log('  clone [staging|prod] - Clone RDS data to local');
      console.log('  testdb              - Test database connectivity');
      console.log('  monitor             - Monitor connections for 2 minutes');
      console.log('');
      console.log('Examples:');
      console.log('  node databaseManager.js setup all');
      console.log('  node databaseManager.js test staging');
      console.log('  node databaseManager.js clone staging');
      console.log('  node databaseManager.js testdb');
      console.log('  node databaseManager.js monitor');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testDatabaseConnection,
  monitorConnections
}; 