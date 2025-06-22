# 🚀 First Day Setup (Quick Start for New Developers)

Welcome! Follow these steps to get the TinderClone backend running locally for any environment (dev, staging, prod).

## 1. Prerequisites
- **Node.js**: v18+ (recommended)
- **npm**: v9+
- **MySQL Client**: 8.0.x (not 9.x)
  - Install: `brew install mysql@8.0`
  - Use: `/opt/homebrew/opt/mysql@8.0/bin/mysql -V`
- **RDS Access**: Ask a project admin for RDS credentials and ensure your IP is whitelisted in the AWS RDS security group.

## 2. Clone & Install
```bash
git clone <repo-url>
cd tinderClone-backend
npm install
```

## 3. Setup Environment Files
```bash
npm run env:setup
# Edit .env.development, .env.staging, .env.production with your credentials
```

## 4. Setup Databases
```bash
npm run db:setup:all
# Or setup individually: npm run db:setup:dev, npm run db:setup:staging, npm run db:setup:prod
```

## 5. Test Database Connections
```bash
npm run db:test:all
```

## 6. Run the Server
```bash
# Development	npm run dev
# Staging		npm run dev:staging
# Production	npm run dev:prod
```

## 7. Test API Endpoints
```bash
curl http://localhost:2000/api/dev/info
curl http://localhost:3001/api/staging/info
curl http://localhost:8080/api/info
```

## 8. Troubleshooting
- **MySQL plugin/auth errors?** Use MySQL 8.0 client, not 9.x
- **DB connection issues?** Check `.env.*` files and RDS security group
- **Need help?** See the Troubleshooting section at the end of this doc

---

# 🏗️ Multi-Environment Architecture Guide

A comprehensive guide for the TinderClone backend with environment-specific APIs, databases, and management tools.

## 🎯 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│   Port: 2000    │    │   Port: 3001    │    │   Port: 8080    │
│   API: /api/dev │    │ API: /api/staging│   │   API: /api     │
│   DB: RDS Dev   │    │   DB: RDS Staging│   │   DB: RDS Prod  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Environment-Specific API Endpoints

### **Development Environment**
- **Port**: 2000
- **API Base**: `http://localhost:2000/api/dev`
- **Database**: RDS Dev (`tinderClone_dev`)
- **Features**: Debug logging, no rate limiting

**Example Endpoints:**
```
GET  http://localhost:2000/api/dev/info
POST http://localhost:2000/api/dev/auth/register
GET  http://localhost:2000/api/dev/users
```

### **Staging Environment**
- **Port**: 3001
- **API Base**: `http://localhost:3001/api/staging`
- **Database**: RDS Staging (`tinderClone_staging`)
- **Features**: Info logging, rate limiting enabled

**Example Endpoints:**
```
GET  http://localhost:3001/api/staging/info
POST http://localhost:3001/api/staging/auth/register
GET  http://localhost:3001/api/staging/users
```

### **Production Environment**
- **Port**: 8080
- **API Base**: `http://localhost:8080/api`
- **Database**: RDS Prod (`tinderClone_prod`)
- **Features**: Warn logging, full security

**Example Endpoints:**
```
GET  http://localhost:8080/api/info
POST http://localhost:8080/api/auth/register
GET  http://localhost:8080/api/users
```

## 📋 Quick Setup Guide

### **Step 1: Setup Environment Files**
```bash
# Copy environment example files
npm run env:setup

# This creates:
# - .env.development
# - .env.staging  
# - .env.production
```

### **Step 2: Update Environment Files**
Edit each `.env.*` file with your actual credentials:

**Development (.env.development):**
```bash
# Update with your RDS development credentials
DEV_MYSQL_HOST=your-rds-endpoint.amazonaws.com
DEV_MYSQL_USER=your-rds-username
DEV_MYSQL_PASSWORD=your-rds-password
DEV_MYSQL_DATABASE=tinderClone_dev

# Generate a unique JWT secret
JWT_SECRET=your-development-jwt-secret
```

**Staging (.env.staging):**
```bash
STAGING_MYSQL_HOST=your-rds-endpoint.amazonaws.com
STAGING_MYSQL_USER=your-rds-username
STAGING_MYSQL_PASSWORD=your-rds-password
JWT_SECRET=your-staging-secret
```

**Production (.env.production):**
```bash
PRODUCTION_MYSQL_HOST=your-rds-endpoint.amazonaws.com
PRODUCTION_MYSQL_USER=your-rds-username
PRODUCTION_MYSQL_PASSWORD=your-rds-password
JWT_SECRET=your-production-secret
```

### **Step 3: Setup All Databases**
```bash
# Setup all environments at once
npm run db:setup:all

# Or setup individually
npm run db:setup:dev
npm run db:setup:staging
npm run db:setup:prod
```

### **Step 4: Test All Environments**
```bash
# Test all database connections
npm run db:test:all

# Or test individually
npm run db:test:dev
npm run db:test:staging
npm run db:test:prod
```

## 🗄️ MySQL Version Requirements

### **RDS Database Versions**
- **Amazon RDS MySQL**: 8.0.41 (recommended)
- **Compatible with**: MySQL 5.7, 8.0.x
- **Authentication**: `mysql_native_password` or `caching_sha2_password`

### **Local MySQL Client Requirements**
- **Recommended**: MySQL 8.0.x client
- **Minimum**: MySQL 5.7 client
- **Not Recommended**: MySQL 9.x (may have authentication plugin issues)

### **Client Installation (macOS)**
```bash
# Install MySQL 8.0 client (recommended)
brew install mysql@8.0

# Use the specific MySQL 8.0 client
/opt/homebrew/opt/mysql@8.0/bin/mysql -V
# Should show: mysql Ver 8.0.42 for macos15.2 on arm64 (Homebrew)

# Connect to RDS
/opt/homebrew/opt/mysql@8.0/bin/mysql -h your-rds-endpoint.amazonaws.com -u admin -p
```

### **Troubleshooting MySQL Client Issues**
If you get authentication plugin errors:
```bash
# Error: Authentication plugin 'mysql_native_password' cannot be loaded
# Solution: Use MySQL 8.0 client instead of MySQL 9.x

# Check your MySQL version
mysql -V

# If it shows MySQL 9.x, install and use MySQL 8.0
brew install mysql@8.0

## 🏃‍♂️ Running Different Environments

### **Development (RDS Development)**
```bash
npm run dev
```
- **URL**: `http://localhost:2000`
- **API**: `http://localhost:2000/api/dev`
- **Database**: RDS Development

### **Staging (RDS Staging)**
```bash
npm run dev:staging
```
- **URL**: `http://localhost:3001`
- **API**: `http://localhost:3001/api/staging`
- **Database**: RDS Staging

### **Production (RDS Production)**
```bash
npm run dev:prod
```
- **URL**: `http://localhost:8080`
- **API**: `http://localhost:8080/api`
- **Database**: RDS Production

## 🔄 Database Management

### **Setup Databases**
```bash
# Setup all environments
npm run db:setup:all

# Setup specific environment
npm run db:setup:dev      # Local development
npm run db:setup:staging  # RDS staging
npm run db:setup:prod     # RDS production
```

### **Test Database Connections**
```bash
# Test all environments
npm run db:test:all

# Test specific environment
npm run db:test:dev
npm run db:test:staging
npm run db:test:prod
```

### **Clone RDS Data to Development**
```bash
# Clone staging data to development
npm run db:clone:staging

# Clone production data to development
npm run db:clone:prod
```

## 📊 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run env:setup` | Copy environment example files |
| `npm run db:setup:all` | Setup all database environments |
| `npm run db:test:all` | Test all database connections |
| `npm run dev` | Start development server (local MySQL) |
| `npm run dev:staging` | Start staging server (RDS staging) |
| `npm run dev:prod` | Start production server (RDS production) |
| `npm run db:clone:staging` | Clone staging data to local |
| `npm run db:clone:prod` | Clone production data to local |
| `npm run env:dev` | Show development environment info |
| `npm run env:staging` | Show staging environment info |
| `npm run env:prod` | Show production environment info |

## 🧪 Testing Different Environments

### **Test API Endpoints**
```bash
# Development
curl http://localhost:2000/api/dev/info

# Staging
curl http://localhost:3001/api/staging/info

# Production
curl http://localhost:8080/api/info
```

### **Test User Registration**
```bash
# Development
curl -X POST http://localhost:2000/api/dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"test@dev.com","password":"123"}'

# Staging
curl -X POST http://localhost:3001/api/staging/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"test@staging.com","password":"123"}'

# Production
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"test@prod.com","password":"123"}'
```

## 🔧 Environment Information Endpoints

Each environment provides detailed information about its configuration:

### **Environment Info**
```
GET /api/dev/info      # Development
GET /api/staging/info  # Staging
GET /api/info          # Production
```

**Response:**
```json
{
  "message": "TinderClone API Environment Info",
  "environment": "development",
  "api": {
    "baseUrl": "http://localhost:2000",
    "version": "v1",
    "prefix": "/api/dev",
    "port": 2000,
    "endpoints": {
      "auth": "/api/dev/auth",
      "users": "/api/dev/users",
      "profile": "/api/dev/profile",
      "requests": "/api/dev/requests",
      "info": "/api/dev/info"
    }
  },
  "database": {
    "host": "localhost",
    "database": "tinderClone_local",
    "connectionLimit": 10
  }
}
```

### **Health Check**
```
GET /api/dev/info/health
GET /api/staging/info/health
GET /api/info/health
```

### **Status**
```
GET /api/dev/info/status
GET /api/staging/info/status
GET /api/info/status
```

## 🛡️ Security Features

### **Environment-Specific Security**
- **Development**: No rate limiting, debug logging
- **Staging**: Rate limiting enabled, info logging
- **Production**: Full rate limiting, warn logging

### **Database Security**
- **Development**: Local MySQL (no network access)
- **Staging**: RDS with staging credentials
- **Production**: RDS with production credentials

### **JWT Secrets**
- Each environment has its own JWT secret
- Never share secrets between environments
- Use strong, unique secrets for production

## 🔄 Development Workflow

### **Daily Development**
```bash
# 1. Start development environment
npm run dev

# 2. Make changes and test with RDS development database
# 3. Test with development database

# 4. When ready for staging testing
npm run db:clone:staging  # Get latest staging data to development
npm run dev:staging       # Test on staging

# 5. When ready for production
npm run db:clone:prod     # Get latest production data to development
npm run dev:prod          # Test on production
```

### **Database Sync Workflow**
```bash
# Clone staging data to development for testing
npm run db:clone:staging

# Clone production data to development for testing
npm run db:clone:prod

# Test changes with real data from staging/production
npm run dev
```

## 🎯 Benefits of This Architecture

- ✅ **Clear Separation**: Each environment has distinct endpoints
- ✅ **Independent Databases**: No data conflicts between environments
- ✅ **Easy Testing**: Test with real data from staging/production
- ✅ **Scalable**: Easy to add new environments
- ✅ **Secure**: Environment-specific security settings
- ✅ **Developer Friendly**: Simple commands for all operations

## 🚨 Important Notes

1. **Never commit `.env.*` files** - They contain sensitive credentials
2. **Use different JWT secrets** for each environment
3. **Test thoroughly** before deploying to production
4. **Backup production data** regularly
5. **Monitor RDS costs** and usage

## 🆘 Troubleshooting

### **Database Connection Issues**
```bash
# Test database connections
npm run db:test:all

# Check environment files
cat .env.development
cat .env.staging
cat .env.production
```

### **API Endpoint Issues**
```bash
# Check if server is running
curl http://localhost:2000/api/dev/info
curl http://localhost:3001/api/staging/info
curl http://localhost:8080/api/info
```

### **Environment Issues**
```bash
# Show environment info
npm run env:dev
npm run env:staging
npm run env:prod
```

---

**🎉 You now have a robust, scalable multi-environment architecture!** 