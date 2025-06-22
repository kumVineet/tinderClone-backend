#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function syncDatabase() {
  console.log('🔄 Database Sync Tool');
  console.log('====================');
  
  let localConnection, rdsConnection;
  
  try {
    // Connect to local database
    localConnection = await mysql.createConnection({
      host: process.env.LOCAL_MYSQL_HOST || 'localhost',
      user: process.env.LOCAL_MYSQL_USER || 'root',
      password: process.env.LOCAL_MYSQL_PASSWORD || '',
      database: process.env.LOCAL_MYSQL_DATABASE || 'tinderClone_local',
    });
    
    // Connect to RDS database
    rdsConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
    
    console.log('✅ Connected to both databases');
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const direction = args[0] || 'pull'; // 'pull' or 'push'
    
    if (direction === 'pull') {
      console.log('📥 Pulling data from RDS to local...');
      await pullFromRDS(localConnection, rdsConnection);
    } else if (direction === 'push') {
      console.log('📤 Pushing data from local to RDS...');
      await pushToRDS(localConnection, rdsConnection);
    } else {
      console.log('❌ Invalid direction. Use "pull" or "push"');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during sync:', error.message);
    process.exit(1);
  } finally {
    if (localConnection) await localConnection.end();
    if (rdsConnection) await rdsConnection.end();
  }
}

async function pullFromRDS(localConnection, rdsConnection) {
  try {
    // Clear local tables
    await localConnection.execute('DELETE FROM connection_requests');
    await localConnection.execute('DELETE FROM users');
    
    // Get users from RDS
    const [users] = await rdsConnection.execute('SELECT * FROM users');
    console.log(`📥 Found ${users.length} users in RDS`);
    
    // Insert users to local
    for (const user of users) {
      await localConnection.execute(
        'INSERT INTO users (id, firstName, lastName, email, password, age, gender, about, photo, skills, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.firstName, user.lastName, user.email, user.password, user.age, user.gender, user.about, user.photo, user.skills, user.createdAt, user.updatedAt]
      );
    }
    
    // Get connection requests from RDS
    const [requests] = await rdsConnection.execute('SELECT * FROM connection_requests');
    console.log(`📥 Found ${requests.length} connection requests in RDS`);
    
    // Insert connection requests to local
    for (const request of requests) {
      await localConnection.execute(
        'INSERT INTO connection_requests (id, fromUserId, toUserId, fromUserName, toUserName, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [request.id, request.fromUserId, request.toUserId, request.fromUserName, request.toUserName, request.status, request.createdAt, request.updatedAt]
      );
    }
    
    console.log('✅ Successfully pulled data from RDS to local');
    
  } catch (error) {
    console.error('❌ Error pulling data:', error.message);
    throw error;
  }
}

async function pushToRDS(localConnection, rdsConnection) {
  try {
    // Clear RDS tables
    await rdsConnection.execute('DELETE FROM connection_requests');
    await rdsConnection.execute('DELETE FROM users');
    
    // Get users from local
    const [users] = await localConnection.execute('SELECT * FROM users');
    console.log(`📤 Found ${users.length} users in local`);
    
    // Insert users to RDS
    for (const user of users) {
      await rdsConnection.execute(
        'INSERT INTO users (id, firstName, lastName, email, password, age, gender, about, photo, skills, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.firstName, user.lastName, user.email, user.password, user.age, user.gender, user.about, user.photo, user.skills, user.createdAt, user.updatedAt]
      );
    }
    
    // Get connection requests from local
    const [requests] = await localConnection.execute('SELECT * FROM connection_requests');
    console.log(`📤 Found ${requests.length} connection requests in local`);
    
    // Insert connection requests to RDS
    for (const request of requests) {
      await rdsConnection.execute(
        'INSERT INTO connection_requests (id, fromUserId, toUserId, fromUserName, toUserName, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [request.id, request.fromUserId, request.toUserId, request.fromUserName, request.toUserName, request.status, request.createdAt, request.updatedAt]
      );
    }
    
    console.log('✅ Successfully pushed data from local to RDS');
    
  } catch (error) {
    console.error('❌ Error pushing data:', error.message);
    throw error;
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncDatabase();
}

module.exports = { syncDatabase }; 