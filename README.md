# TinderClone Backend

A Node.js/TypeScript backend for the TinderClone application with three-environment setup (Development, Staging, Production) using Amazon RDS databases.

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

## 🌍 Environment Configuration

This project supports three environments with distinct APIs and databases:

### 🏠 Development Environment
- **File**: `.env.development`
- **Database**: RDS Development (`tinderClone_dev`)
- **Port**: 2000
- **API**: `http://localhost:2000/api/dev`
- **Features**: Debug logging, no rate limiting

### 🧪 Staging Environment
- **File**: `.env.staging`
- **Database**: RDS Staging (`tinderClone_staging`)
- **Port**: 3001
- **API**: `http://localhost:3001/api/staging`
- **Features**: Info logging, rate limiting enabled

### 🚀 Production Environment
- **File**: `.env.production`
- **Database**: RDS Production (`tinderBackend`)
- **Port**: 8080
- **API**: `http://localhost:8080/api`
- **Features**: Warn logging, full security

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

## 📋 Setup Checklist

### Before You Start
- [ ] Node.js installed (v18+)
- [ ] npm installed
- [ ] Git installed
- [ ] MySQL 8.0 client installed
- [ ] RDS credentials from team lead
- [ ] IP whitelisted in RDS security group

### Setup Steps
- [ ] Clone repository: `git clone <repo-url>`
- [ ] Enter project: `cd tinderClone-backend`
- [ ] Install dependencies: `npm install`
- [ ] Setup environment files: `npm run env:setup`
- [ ] Update environment files with RDS credentials
- [ ] Setup databases: `npm run db:setup:all`
- [ ] Test connections: `npm run db:test:all`
- [ ] Start server: `npm run dev`
- [ ] See "SQL Database connected..." and "Server is running on port 2000 in development mode"

### Optional (First Time)
- [ ] Clone data from staging: `npm run db:clone:staging`
- [ ] Clone data from production: `npm run db:clone:prod`
- [ ] Read API docs in `apiList.md`
- [ ] Read `ARCHITECTURE_GUIDE.md` for detailed setup

## 🗄️ Database Architecture

This project uses **Amazon RDS** for all environments:

- **Development**: RDS Development database (`tinderClone_dev`)
- **Staging**: RDS Staging database (`tinderClone_staging`)
- **Production**: RDS Production database (`tinderBackend`)
- **Sync**: Tools to clone data between environments

### Benefits:
- 🎯 **Environment Isolation**: No data conflicts between environments
- 🔒 **Secure**: Each environment has its own credentials
- 🧪 **Testing**: Test with real data from staging/production
- 📊 **Monitoring**: Monitor each environment independently
- 🔄 **Data Sync**: Easy to clone data for testing

## 🔧 Environment Variables

This application uses environment-specific configuration files. Setup with:

```bash
npm run env:setup
```

**⚠️ Important**: All environment variables are required. The application will fail to start if any required environment variable is missing.

### Required Environment Variables

#### Server Configuration
- `PORT` - Server port (development: 2000, staging: 3001, production: 8080)
- `NODE_ENV` - Environment (development/staging/production)

#### API Configuration
- `API_BASE_URL` - API base URL (localhost for local development)
- `API_VERSION` - API version (v1)
- `API_PREFIX` - API prefix (/api/dev, /api/staging, /api)

#### CORS Configuration
- `FRONTEND_URL` - Frontend URL for CORS

#### JWT Configuration
- `JWT_SECRET` - Secret key for JWT tokens (different for each environment)
- `JWT_EXPIRES_IN` - JWT token expiration time (e.g., 1h)

#### Cookie Configuration
- `COOKIE_EXPIRES_HOURS` - Cookie expiration time in hours (e.g., 8)

#### Database Configuration

**Development (RDS Development):**
- `DEV_MYSQL_HOST` - Development RDS endpoint
- `DEV_MYSQL_USER` - Development RDS username
- `DEV_MYSQL_PASSWORD` - Development RDS password
- `DEV_MYSQL_DATABASE` - Development database name (tinderClone_dev)
- `DEV_MYSQL_CONNECTION_LIMIT` - Connection pool limit (e.g., 10)
- `DEV_MYSQL_QUEUE_LIMIT` - Queue limit (e.g., 0)

**Staging (RDS Staging):**
- `STAGING_MYSQL_HOST` - Staging RDS endpoint
- `STAGING_MYSQL_USER` - Staging RDS username
- `STAGING_MYSQL_PASSWORD` - Staging RDS password
- `STAGING_MYSQL_DATABASE` - Staging database name (tinderClone_staging)
- `STAGING_MYSQL_CONNECTION_LIMIT` - Connection pool limit (e.g., 20)
- `STAGING_MYSQL_QUEUE_LIMIT` - Queue limit (e.g., 0)

**Production (RDS Production):**
- `PRODUCTION_MYSQL_HOST` - Production RDS endpoint
- `PRODUCTION_MYSQL_USER` - Production RDS username
- `PRODUCTION_MYSQL_PASSWORD` - Production RDS password
- `PRODUCTION_MYSQL_DATABASE` - Production database name (tinderBackend)
- `PRODUCTION_MYSQL_CONNECTION_LIMIT` - Connection pool limit (e.g., 50)
- `PRODUCTION_MYSQL_QUEUE_LIMIT` - Queue limit (e.g., 0)

#### Default User Configuration
- `DEFAULT_USER_PHOTO` - Default profile photo URL
- `DEFAULT_USER_ABOUT` - Default user about text

#### Logging Configuration
- `LOG_LEVEL` - Log level (development: debug, staging: info, production: warn)

## 🗄️ Database Management

### Setup Databases
```bash
# Setup all environments
npm run db:setup:all

# Setup specific environment
npm run db:setup:dev      # Development
npm run db:setup:staging  # Staging
npm run db:setup:prod     # Production
```

### Test Database Connections
```bash
# Test all environments
npm run db:test:all

# Test specific environment
npm run db:test:dev
npm run db:test:staging
npm run db:test:prod
```

### Clone Data Between Environments
```bash
# Clone staging data to development
npm run db:clone:staging

# Clone production data to development
npm run db:clone:prod
```

### Database Schema
The application automatically creates:
- `users` table - User profiles and authentication
- `connection_requests` table - Connection requests between users
- Sample data for development

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

### Getting Help

If you encounter issues:

1. **Check this guide first**
2. **Read ARCHITECTURE_GUIDE.md** for detailed setup instructions
3. **Look at the error message** in the console
4. **Contact your team lead** with:
   - Exact error message
   - Your OS and Node.js version
   - Environment you're trying to run
   - Steps you followed

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
- **ARCHITECTURE_GUIDE.md**: For detailed architecture and setup
- **apiList.md**: For available API endpoints

## 🎯 Benefits of Multi-Environment Setup

- **🏠 Development**: Fast development with RDS database
- **🧪 Staging**: Safe testing environment that mirrors production
- **🚀 Production**: Stable, secure production environment
- **🔒 Security**: Proper isolation between environments
- **🔄 Workflow**: Clear development → staging → production pipeline
- **🐛 Debugging**: Easy to reproduce issues in staging
- **📊 Monitoring**: Monitor each environment independently

---

**🎉 Welcome to the team! Happy coding! 🚀** 