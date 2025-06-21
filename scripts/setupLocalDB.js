#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Function to properly split SQL statements
function splitSQLStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = '';
  let parenDepth = 0;
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];
    
    // Handle string literals
    if ((char === "'" || char === '"') && !inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar && inString) {
      // Check for escaped quotes
      if (sql[i - 1] !== '\\') {
        inString = false;
        stringChar = '';
      }
    }
    
    // Handle parentheses
    if (!inString) {
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
    }
    
    // Only split on semicolon if not in string and parentheses are balanced
    if (char === ';' && !inString && parenDepth === 0) {
      currentStatement += char;
      const trimmed = currentStatement.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }
  
  // Add any remaining statement
  const trimmed = currentStatement.trim();
  if (trimmed && !trimmed.startsWith('--')) {
    statements.push(trimmed);
  }
  
  return statements;
}

async function setupLocalDatabase() {
  console.log('🏗️  Setting up local MySQL database...');
  
  let connection;
  
  try {
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.LOCAL_MYSQL_HOST || 'localhost',
      user: process.env.LOCAL_MYSQL_USER || 'root',
      password: process.env.LOCAL_MYSQL_PASSWORD || '',
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database first (using query instead of execute for DDL)
    const databaseName = process.env.LOCAL_MYSQL_DATABASE || 'tinderClone_local';
    console.log(`📝 Creating database: ${databaseName}`);
    
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
      console.log(`✅ Database '${databaseName}' created/verified`);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log(`✅ Database '${databaseName}' already exists`);
    }
    
    // Close connection and reconnect to the specific database
    await connection.end();
    connection = await mysql.createConnection({
      host: process.env.LOCAL_MYSQL_HOST || 'localhost',
      user: process.env.LOCAL_MYSQL_USER || 'root',
      password: process.env.LOCAL_MYSQL_PASSWORD || '',
      database: databaseName,
    });
    
    console.log(`✅ Connected to '${databaseName}' database`);
    
    // Read the SQL setup script
    const sqlScriptPath = path.join(__dirname, 'setupLocalDatabase.sql');
    const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
    
    console.log('📝 Executing table creation and data setup...');
    
    // Clean the script by removing CREATE DATABASE and USE statements
    const cleanScript = sqlScript
      .replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '') // Remove CREATE DATABASE
      .replace(/USE.*?;/gi, '') // Remove USE statements
      .replace(/--.*$/gm, '') // Remove single-line comments
      .trim();
    
    if (cleanScript) {
      try {
        // Split into proper SQL statements
        const statements = splitSQLStatements(cleanScript);
        
        console.log(`📋 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement individually
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (statement.trim()) {
            try {
              await connection.execute(statement);
              console.log(`✅ Executed statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
            } catch (error) {
              // Ignore errors for statements that might already exist
              if (!error.message.includes('already exists') && 
                  !error.message.includes('Duplicate entry') &&
                  !error.message.includes('Duplicate key name')) {
                console.warn(`⚠️  Warning on statement ${i + 1}: ${error.message}`);
              }
            }
          }
        }
        
        console.log('✅ SQL script executed successfully');
      } catch (error) {
        console.error('❌ Error executing SQL script:', error.message);
        throw error;
      }
    }
    
    console.log('✅ Local database setup completed successfully!');
    console.log(`📊 Database: ${databaseName}`);
    console.log('🏠 Host: localhost');
    console.log('👤 User: ' + (process.env.LOCAL_MYSQL_USER || 'root'));
    
  } catch (error) {
    console.error('❌ Error setting up local database:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is installed and running');
    console.log('2. Check your LOCAL_MYSQL_* environment variables');
    console.log('3. Ensure MySQL user has CREATE DATABASE privileges');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupLocalDatabase();
}

module.exports = { setupLocalDatabase }; 