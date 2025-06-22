# TinderClone Backend

A Node.js/TypeScript backend for the TinderClone application with three-environment setup (Development, Staging, Production) using Amazon RDS databases.

## 📋 Table of Contents

1. [🏗️ Multi-Environment Architecture](#️-multi-environment-architecture)
2. [🚀 Quick Start](#-quick-start)
3. [🛠️ Prerequisites & System Setup](#️-prerequisites--system-setup)
4. [📁 Repository Setup](#-repository-setup)
5. [⚙️ Environment Configuration](#️-environment-configuration)
6. [🗄️ Database Setup](#-database-setup)
7. [🚀 Application Setup](#-application-setup)
8. [🧪 Testing & Verification](#-testing--verification)
9. [🔄 Development Workflow](#-development-workflow)
10. [🔧 Database Connection Issues & Monitoring](#-database-connection-issues--monitoring)
11. [📚 Available Commands](#-available-commands)
12. [🚨 Troubleshooting](#-troubleshooting)
13. [🔒 Security Best Practices](#-security-best-practices)
14. [📞 Support](#-support)

---

## 🏗️ Multi-Environment Architecture

This project uses **Amazon RDS** for all environments with environment-specific APIs and databases:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│   Port: 2000    │    │   Port: 3001    │    │   Port: 8080    │
│   API: /api/dev │    │ API: /api/staging│   │   API: /api     │
│   DB: RDS Dev   │    │   DB: RDS Staging│   │   DB: RDS Prod  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Benefits:**
- 🎯 **Environment Isolation**: Each environment has its own database and API endpoints
- 🔒 **Secure**: Environment-specific credentials and configurations
- 🧪 **Testing**: Easy to test with real data from staging/production
- 🔄 **Data Sync**: Tools to clone data between environments
- 📊 **Monitoring**: Each environment can be monitored independently

---

## 🚀 Quick Start

### First Time Setup (5 minutes)

```bash
# 1. Clone and enter project
git clone <your-repo-url>
cd tinderClone-backend

# 2. Install dependencies
npm install

# 3. Setup environment files
npm run env:setup

# 4. Update environment files with RDS credentials (get from team lead)
# Edit .env.development, .env.staging, .env.production

# 5. Setup all databases
npm run db:setup:all

# 6. Test database connections
npm run db:test:all

# 7. Start development server
npm run dev
```

### Prerequisites
- ✅ **Node.js** (v18 or higher)
- ✅ **npm** or **yarn**
- ✅ **Git**
- ✅ **MySQL Client** (8.0.x recommended, not 9.x)
- ✅ **RDS Access** (credentials and IP whitelist from team lead)

#### Installing MySQL Client
**macOS:**
```bash
# Install MySQL 8.0 client (recommended)
brew install mysql@8.0

# Use the specific MySQL 8.0 client
/opt/homebrew/opt/mysql@8.0/bin/mysql -V
# Should show: mysql Ver 8.0.42 for macos15.2 on arm64 (Homebrew)
```

**Windows/Linux:**
Download MySQL 8.0 client from [mysql.com](https://dev.mysql.com/downloads/mysql/)

---

## 🛠️ Prerequisites & System Setup

### Step 1: Install Required Software

**Node.js & npm:**
```bash
# Check if Node.js is installed (v18+ required)
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Recommended: Node.js 18.x or higher
```

**Git:**
```bash
# Check if Git is installed
git --version

# If not installed:
# macOS: brew install git
# Windows: Download from https://git-scm.com/
# Linux: sudo apt-get install git
```

**MySQL Client (8.0.x recommended):**
```bash
# macOS
brew install mysql@8.0

# Verify installation
/opt/homebrew/opt/mysql@8.0/bin/mysql -V
# Should show: mysql Ver 8.0.42 for macos15.2 on arm64 (Homebrew)

# Windows/Linux: Download from https://dev.mysql.com/downloads/mysql/
```

### Step 2: Get Access Credentials

**Required from Team Lead:**
- ✅ RDS database credentials for all environments
- ✅ IP whitelist access to RDS security groups
- ✅ Repository access (GitHub/GitLab)
- ✅ Environment variable templates

---

## 📁 Repository Setup

### Step 3: Clone Repository

```bash
# Clone the repository
git clone <your-repo-url>
cd tinderClone-backend

# Verify you're in the correct directory
ls -la
# Should see: package.json, src/, scripts/, etc.
```

### Step 4: Install Dependencies

```bash
# Install all npm dependencies
npm install

# Verify installation
npm list --depth=0
# Should show all dependencies without errors
```

---

## ⚙️ Environment Configuration

### Step 5: Setup Environment Files

```bash
# Create environment files for all environments
npm run env:setup

# Verify files were created
ls -la .env.*
# Should see: .env.development, .env.staging, .env.production
```

### Step 6: Configure Environment Variables

**Edit `.env.development`:**
```bash
# Open the development environment file
code .env.development  # or your preferred editor

# Fill in the required values from your team lead:
NODE_ENV=development
PORT=2000

# JWT Configuration
JWT_SECRET=your_development_jwt_secret_here
JWT_EXPIRES_IN=1h

# Database Configuration (RDS Development)
DEV_MYSQL_HOST=your-dev-rds-endpoint.amazonaws.com
DEV_MYSQL_USER=your_dev_username
DEV_MYSQL_PASSWORD=your_dev_password
DEV_MYSQL_DATABASE=tinderClone_dev
DEV_MYSQL_CONNECTION_LIMIT=10
DEV_MYSQL_QUEUE_LIMIT=0

# Frontend URL
FRONTEND_URL=http://localhost:3000

# MongoDB URI (if using MongoDB features)
MONGODB_URI=your_mongodb_uri_here
```

**Repeat for `.env.staging` and `.env.production` with appropriate values.**

### Step 7: Verify Environment Configuration

```bash
# Test environment configuration
npm run env:test

# Should show: "Environment configuration is valid"
```

### Environment-Specific Configurations

**Development Environment:**
- **File**: `.env.development`
- **Database**: RDS Development (`tinderClone_dev`)
- **Port**: 2000
- **API**: `http://localhost:2000/api/dev`
- **Features**: Debug logging, no rate limiting

**Staging Environment:**
- **File**: `.env.staging`
- **Database**: RDS Staging (`tinderClone_staging`)
- **Port**: 3001
- **API**: `http://localhost:3001/api/staging`
- **Features**: Info logging, rate limiting enabled

**Production Environment:**
- **File**: `.env.production`
- **Database**: RDS Production (`tinderBackend`)
- **Port**: 8080
- **API**: `http://localhost:8080/api`
- **Features**: Warn logging, full security

---

## 🗄️ Database Setup

### Step 8: Test Database Connectivity

```bash
# Test connection to development database
node scripts/databaseManager.js testdb

# Expected output:
# 🔍 Testing database connectivity...
# Host: your-dev-rds-endpoint.amazonaws.com
# Database: tinderClone_dev
# User: your_dev_username
# ✅ Database connection successful!
# ✅ Query test successful: { test: 1, current_time: '2024-01-15T10:30:00.000Z' }
# ✅ Users table accessible: 0 users found
# ✅ All database tests passed!
```

**If this fails, check:**
- ✅ RDS credentials are correct
- ✅ IP is whitelisted in RDS security group
- ✅ Network connectivity to RDS endpoint

### Step 9: Setup Database Schema

```bash
# Setup database tables for development
node scripts/databaseManager.js setup development

# Expected output:
# 🗄️ Setting up development database...
# ✅ Database setup completed successfully!
```

### Step 10: Test All Environments (Optional)

```bash
# Test all database connections
npm run db:test:all

# Setup all databases (if needed)
npm run db:setup:all
```

### Database Management

**Setup Databases:**
```bash
# Setup all environments
npm run db:setup:all

# Setup specific environment
npm run db:setup:dev      # Development
npm run db:setup:staging  # Staging
npm run db:setup:prod     # Production
```

**Test Database Connections:**
```bash
# Test all environments
npm run db:test:all

# Test specific environment
npm run db:test:dev
npm run db:test:staging
npm run db:test:prod
```

**Clone Data Between Environments:**
```bash
# Clone staging data to development
npm run db:clone:staging

# Clone production data to development
npm run db:clone:prod
```

**Database Schema:**
The application automatically creates:
- `users` table - User profiles and authentication
- `connection_requests` table - Connection requests between users
- Sample data for development

---

## 🚀 Application Setup

### Step 11: Build the Application

```bash
# Build for development environment
npm run build:dev

# Verify build output
ls -la dist/
# Should see compiled JavaScript files
```

### Step 12: Start Development Server

```bash
# Start development server with hot reload
npm run dev

# Expected output:
# 🚀 Server is running on port 2000 in development mode
# 📡 API Base URL: http://localhost:2000
# 🔗 API Prefix: /api/dev
# 🌐 Frontend URL: http://localhost:3000
# 🗄️ Database: tinderClone_dev on your-dev-rds-endpoint.amazonaws.com
```

**Keep this terminal open - the server is now running!**

### Environment Commands

```bash
# Development
npm run dev              # Start development server
npm run start:dev        # Start built development server

# Staging
npm run dev:staging      # Start staging server
npm run start:staging    # Start built staging server

# Production
npm run dev:prod         # Start production server (local)
npm start                # Start production server (built)

# Build for different environments
npm run build:dev        # Build for development
npm run build:staging    # Build for staging
npm run build:prod       # Build for production
```

---

## 🧪 Testing & Verification

### Step 13: Verify API Endpoints

**Test the root endpoint:**
```bash
curl http://localhost:2000/
```

**Expected response:**
```json
{
  "message": "TinderClone API - DEVELOPMENT Environment",
  "environment": "development",
  "apiPrefix": "/api/dev",
  "port": 2000,
  "endpoints": {
    "info": "/api/dev/info",
    "health": "/api/dev/info/health",
    "status": "/api/dev/info/status",
    "auth": "/api/dev/auth",
    "users": "/api/dev/users",
    "profile": "/api/dev/profile",
    "requests": "/api/dev/requests"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Step 14: Test Health Endpoints

```bash
# Basic health check
curl http://localhost:2000/api/dev/info/health

# Database health check
curl http://localhost:2000/api/dev/info/db-health

# Detailed status
curl http://localhost:2000/api/dev/info/status
```

### Step 15: Test Database Health Monitoring

```bash
# Monitor database connections for 2 minutes
node scripts/databaseManager.js monitor

# Expected output:
# 📊 Monitoring database connections...
# ✅ Successful connections: 24, ❌ Failed: 0
# 📊 Monitoring completed.
# Total successful: 24, Total failed: 0
```

---

## 🔄 Development Workflow

### Step 16: Understanding the Project Structure

```bash
# Explore the project structure
tree src/ -I node_modules

# Key directories:
# src/
# ├── config/          # Environment and database configuration
# ├── middlewares/     # Express middlewares (auth, etc.)
# ├── models/          # Database models (userSQL.ts, connectionRequestSQL.ts)
# ├── Routes/          # API route handlers
# ├── types/           # TypeScript type definitions
# ├── utils/           # Utility functions (validations)
# └── App.ts           # Main application file
```

### Step 17: Code Changes & Testing

**Making changes:**
1. Edit files in `src/` directory
2. Server automatically restarts (hot reload)
3. Test your changes via API endpoints
4. Use the monitoring tools if needed

**Example - Test profile update:**
```bash
# First, create a user (via signup endpoint)
curl -X POST http://localhost:2000/api/dev/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25,
    "gender": "male"
  }'

# Then test profile update (with proper authentication)
# (You'll need to implement proper auth flow)
```

---

## 🔧 Database Connection Issues & Monitoring

### ECONNRESET Error Fix

The application now includes robust error handling for database connection issues, particularly `ECONNRESET` errors that can occur during profile updates. The fix includes:

- **🔄 Retry Logic**: Database operations automatically retry up to 3 times with exponential backoff
- **🛡️ Connection Error Handling**: Specific handling for `ECONNRESET`, `Connection lost`, and `Connection timeout` errors
- **📝 Better Error Messages**: More informative error responses for different types of failures
- **⚡ Graceful Degradation**: Application continues to function even during temporary connection issues

### Database Health Monitoring

Use these tools to monitor and diagnose database connectivity:

```bash
# Test database connectivity
node scripts/databaseManager.js testdb

# Monitor connections for 2 minutes
node scripts/databaseManager.js monitor

# Check database health via API
curl http://localhost:2000/api/dev/info/db-health
```

### Common Connection Issues & Solutions

If you're experiencing frequent `ECONNRESET` errors:

1. **🔍 Check database server status**
   ```bash
   node scripts/databaseManager.js testdb
   ```

2. **🌐 Verify network connectivity**
   - Check if you can ping the RDS endpoint
   - Verify your IP is whitelisted in RDS security group

3. **🔥 Check firewall settings**
   - Ensure port 3306 is open for MySQL connections
   - Check corporate firewall policies

4. **📊 Monitor connection limits**
   - Check if you're hitting connection pool limits
   - Monitor RDS connection metrics

5. **🔄 Use the monitoring tools**
   ```bash
   # Monitor for 2 minutes to identify patterns
   node scripts/databaseManager.js monitor
   ```

### Database Health Endpoints

The API includes health check endpoints for monitoring:

- `GET /api/dev/info/health` - Basic health check
- `GET /api/dev/info/db-health` - Database connectivity check
- `GET /api/dev/info/status` - Detailed system status

Example response from `/api/dev/info/db-health`:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📚 Available Commands

### Development
```bash
npm run dev              # Start development server
npm run dev:staging      # Start staging server
npm run dev:prod         # Start production server (local)
npm run build           # Build for current environment
npm run build:dev       # Build for development
npm run build:staging   # Build for staging
npm run build:prod      # Build for production
npm start               # Start production server
npm run start:staging   # Start staging server
npm run start:dev       # Start development server
```

### Database
```bash
npm run db:setup:all    # Setup all databases
npm run db:setup:dev    # Setup development database
npm run db:setup:staging # Setup staging database
npm run db:setup:prod   # Setup production database
npm run db:test:all     # Test all database connections
npm run db:test:dev     # Test development database
npm run db:test:staging # Test staging database
npm run db:test:prod    # Test production database
npm run db:clone:staging # Clone staging data to development
npm run db:clone:prod   # Clone production data to development
```

### Environment
```bash
npm run env:setup       # Setup environment files
npm run env:dev         # Show development environment info
npm run env:staging     # Show staging environment info
npm run env:prod        # Show production environment info
```

### Utilities
```bash
npm run clean           # Clean build files
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. "Authentication plugin 'mysql_native_password' cannot be loaded" Error
```bash
# Use MySQL 8.0 client instead of MySQL 9.x
brew install mysql@8.0
/opt/homebrew/opt/mysql@8.0/bin/mysql -h your-rds-endpoint.amazonaws.com -u admin -p
```

#### 2. "Access denied" Error
- Check your RDS credentials in environment files
- Ensure your IP is whitelisted in RDS security group
- Verify RDS instance is running

#### 3. "Unknown database" Error
```bash
npm run db:setup:dev    # Setup development database
npm run db:setup:staging # Setup staging database
npm run db:setup:prod   # Setup production database
```

#### 4. "ECONNREFUSED" Error
- Check if RDS instance is running in AWS Console
- Verify RDS endpoint and credentials
- Check if your IP is whitelisted in RDS security group

#### 5. "Module not found" Error
```bash
npm install
```

#### 6. "Port already in use" Error
```bash
# Find and kill the process using port
lsof -ti:2000 | xargs kill -9  # Development
lsof -ti:3001 | xargs kill -9  # Staging
lsof -ti:8080 | xargs kill -9  # Production

# Or change the port in environment file
PORT=3001
```

#### 7. "Environment file not found" Error
```bash
# Create environment files
npm run env:setup
# Then update with your RDS credentials
```

#### 8. "Missing required environment variable" Error
- Ensure all required environment variables are set in `.env.*` files
- Check that RDS credentials are correct
- Verify database names match your RDS setup

#### 9. "ECONNRESET" errors during profile updates
```bash
# This is now handled automatically with retry logic
# But you can monitor it:
node scripts/databaseManager.js monitor

# Check database health:
curl http://localhost:2000/api/dev/info/db-health
```

#### 10. Database connection fails
```bash
# Test connectivity
node scripts/databaseManager.js testdb

# Check environment variables
npm run env:test

# Verify RDS credentials and IP whitelist
```

#### 11. TypeScript compilation errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix any type errors before running
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Or set log level in environment
LOG_LEVEL=debug npm run dev
```

### Getting Help

If you encounter issues:

1. **Check this guide first**
2. **Read ARCHITECTURE_GUIDE.md** for detailed architecture information
3. **Look at the error message** in the console
4. **Contact your team lead** with:
   - Exact error message
   - Your OS and Node.js version
   - Environment you're trying to run
   - Steps you followed

---

## 🔒 Security Best Practices

### For Team Lead:
1. **Share credentials securely** - Use password managers or secure channels
2. **Use IAM roles** - Consider using AWS IAM roles instead of master credentials
3. **Database users** - Create separate database users for each environment
4. **VPC Security Groups** - Ensure RDS is accessible from team members' IPs
5. **Environment isolation** - Keep staging and production completely separate

### For Team Members:
1. **Never commit environment files** - All .env files are gitignored
2. **Use secure channels** - Get credentials from team lead via secure channels
3. **Work with RDS** - All environments use RDS databases
4. **Report issues** - If you can't connect, check with team lead about IP whitelisting
5. **Environment awareness** - Always check which environment you're running

## 🌐 Network Access

### RDS Access Requirements:
- **All environments** require RDS access
- **Your IP must be whitelisted** in RDS security group
- **Internet connection required** for all development

### Adding IP to RDS Security Group:
1. Go to AWS RDS Console
2. Select your database instance
3. Go to "Connectivity & security" tab
4. Click on the Security Group
5. Add inbound rule for MySQL (port 3306) with your IP

## 🎯 Development Workflow

1. **Setup**: Get RDS credentials and run `npm run db:setup:all`
2. **Develop**: Work with development environment using `npm run dev`
3. **Test**: Test with staging data using `npm run db:clone:staging`
4. **Staging**: Deploy to staging with `npm run dev:staging`
5. **Production**: Deploy to production with `npm run dev:prod`
6. **Sync**: Use `npm run db:clone:prod` to get latest production data

## 🔄 Database Changes

If you need to make database schema changes:
1. Discuss with the team first
2. Update the SQL script in `scripts/setupDatabase.sql`
3. Test changes in development
4. Test changes in staging
5. Coordinate deployment with team lead
6. Document changes for other team members

## 📞 Support

- **Team Lead**: For credentials and access issues
- **This README**: For setup and troubleshooting
- **ARCHITECTURE_GUIDE.md**: For detailed architecture information
- **apiList.md**: For available API endpoints

## 🎯 Benefits of Multi-Environment Setup

- **🏠 Development**: Fast development with RDS database
- **🧪 Staging**: Safe testing environment that mirrors production
- **🚀 Production**: Stable, secure production environment
- **🔒 Security**: Proper isolation between environments
- **🔄 Workflow**: Clear development → staging → production pipeline
- **🐛 Debugging**: Easy to reproduce issues in staging
- **📊 Monitoring**: Monitor each environment independently

## ✅ Final Verification Checklist

Before you start developing, verify:

- [ ] ✅ Node.js v18+ installed
- [ ] ✅ MySQL 8.0 client installed
- [ ] ✅ Repository cloned and dependencies installed
- [ ] ✅ Environment files configured with correct credentials
- [ ] ✅ Database connectivity tested successfully
- [ ] ✅ Database schema setup completed
- [ ] ✅ Development server starts without errors
- [ ] ✅ Health endpoints return healthy status
- [ ] ✅ Database monitoring tools work
- [ ] ✅ API endpoints respond correctly

**🎉 Congratulations! You're now ready to contribute to the TinderClone backend project!**

---

**🎉 Welcome to the team! Happy coding! 🚀** 