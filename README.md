# TinderClone Backend

A Node.js/TypeScript backend for the TinderClone application with three-environment setup (Development, Staging, Production) and team-friendly hybrid database architecture.

## 🏗️ Team Architecture

This project uses a **hybrid database approach** for optimal team collaboration:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer 1   │    │   Developer 2   │    │   Developer 3   │
│  Local MySQL    │    │  Local MySQL    │    │  Local MySQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Shared RDS    │
                    │  (Staging/Prod) │
                    └─────────────────┘
```

### **Benefits:**
- ⚡ **Fast Development**: Each developer works with local MySQL (no network latency)
- 🔒 **Safe Testing**: Can't break team data during development
- 💰 **Cost Effective**: No RDS charges during development
- 🌐 **Offline Work**: No internet required for development
- 🧪 **Proper Testing**: Staging environment for pre-production testing

## 🚀 Quick Start

### First Time Setup (5 minutes)

```bash
# 1. Clone and enter project
git clone <your-repo-url>
cd tinderClone-backend

# 2. Run automated setup
./setup.sh

# 3. Update environment files with credentials (get from team lead)
# 4. Setup local database (if not done by script)
npm run setup:local-db

# 5. Start development
npm run dev
```

### Prerequisites
- ✅ **Node.js** (v16 or higher)
- ✅ **npm** or **yarn**
- ✅ **Git**
- ✅ **MySQL** (local installation)

#### Installing MySQL
**macOS:**
```bash
brew install mysql
brew services start mysql

# Optional: Install MySQL Workbench for GUI database management
brew install --cask mysqlworkbench
```

**Windows:**
Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

## 🌍 Environment Configuration

This project supports three environments:

### 🏠 Development Environment
- **File**: `.env.development`
- **Database**: Local MySQL
- **Port**: 2000
- **Features**: Debug logging, no rate limiting

### 🧪 Staging Environment
- **File**: `.env.staging`
- **Database**: Staging RDS
- **Port**: 3000
- **Features**: Info logging, rate limiting enabled

### 🚀 Production Environment
- **File**: `.env.production`
- **Database**: Production RDS
- **Port**: 8080
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
- [ ] Node.js installed (v16+)
- [ ] npm installed
- [ ] Git installed
- [ ] MySQL installed and running

### Setup Steps
- [ ] Clone repository: `git clone <repo-url>`
- [ ] Enter project: `cd tinderClone-backend`
- [ ] Run setup script: `./setup.sh`
- [ ] Get credentials from team lead
- [ ] Update environment files with credentials
- [ ] Setup local database: `npm run setup:local-db`
- [ ] Test server: `npm run dev`
- [ ] See "SQL Database connected..." and "Server is running on port 2000 in development mode"

### Optional (First Time)
- [ ] Pull data from RDS: `npm run sync:db:pull`
- [ ] Read API docs in `apiList.md`
- [ ] Join team discussions

## 🗄️ Database Architecture

This project uses a **hybrid database approach**:

- **Development**: Local MySQL database for fast, offline development
- **Staging**: Staging RDS MySQL for testing
- **Production**: Production RDS MySQL for live deployment
- **Sync**: Tools to sync data between environments

### Benefits:
- ⚡ **Fast Development**: No network latency
- 🔒 **Safe Testing**: Can't break production data
- 💰 **Cost Effective**: No RDS charges during development
- 🌐 **Offline Work**: No internet required for development
- 🧪 **Proper Testing**: Staging environment for pre-production testing

## 🔧 Environment Variables

This application uses environment-specific configuration files. Copy the example and update with your values:

```bash
cp .env.development.example .env.development
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

**⚠️ Important**: All environment variables are required. The application will fail to start if any required environment variable is missing.

### Required Environment Variables

#### Server Configuration
- `PORT` - Server port (development: 2000, staging: 3000, production: 8080)
- `NODE_ENV` - Environment (development/staging/production)

#### CORS Configuration
- `FRONTEND_URL` - Frontend URL for CORS

#### JWT Configuration
- `JWT_SECRET` - Secret key for JWT tokens (different for each environment)
- `JWT_EXPIRES_IN` - JWT token expiration time (e.g., 1h)

#### Cookie Configuration
- `COOKIE_EXPIRES_HOURS` - Cookie expiration time in hours (e.g., 8)

#### Database Configuration

**Development (Local MySQL):**
- `LOCAL_MYSQL_HOST` - Local MySQL host (e.g., localhost)
- `LOCAL_MYSQL_USER` - Local MySQL username (e.g., root)
- `LOCAL_MYSQL_PASSWORD` - Local MySQL password (can be empty for development)
- `LOCAL_MYSQL_DATABASE` - Local database name (e.g., tinderClone_local)
- `LOCAL_MYSQL_CONNECTION_LIMIT` - Connection pool limit (e.g., 10)
- `LOCAL_MYSQL_QUEUE_LIMIT` - Queue limit (e.g., 0)

**Staging (Staging RDS):**
- `STAGING_MYSQL_HOST` - Staging RDS endpoint
- `STAGING_MYSQL_USER` - Staging RDS username
- `STAGING_MYSQL_PASSWORD` - Staging RDS password
- `STAGING_MYSQL_DATABASE` - Staging database name
- `STAGING_MYSQL_CONNECTION_LIMIT` - Connection pool limit (e.g., 20)
- `STAGING_MYSQL_QUEUE_LIMIT` - Queue limit (e.g., 0)

**Production (Production RDS):**
- `PRODUCTION_MYSQL_HOST` - Production RDS endpoint
- `PRODUCTION_MYSQL_USER` - Production RDS username
- `PRODUCTION_MYSQL_PASSWORD` - Production RDS password
- `PRODUCTION_MYSQL_DATABASE` - Production database name
- `PRODUCTION_MYSQL_CONNECTION_LIMIT` - Connection pool limit (e.g., 50)
- `PRODUCTION_MYSQL_QUEUE_LIMIT` - Queue limit (e.g., 0)

#### Default User Configuration
- `DEFAULT_USER_PHOTO` - Default profile photo URL
- `DEFAULT_USER_ABOUT` - Default user about text

#### Logging Configuration
- `LOG_LEVEL` - Log level (development: debug, staging: info, production: warn)

## 🗄️ Database Management

### Local Development
```bash
# Setup local database
npm run setup:local-db

# Reset local database
npm run db:reset
```

### Data Synchronization
```bash
# Pull data from RDS to local (get latest production data)
npm run sync:db:pull

# Push data from local to RDS (deploy your changes)
npm run sync:db:push
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
npm run setup:local-db  # Setup local database
npm run sync:db:pull    # Pull data from RDS
npm run sync:db:push    # Push data to RDS
npm run db:reset        # Reset local database
```

### Utilities
```bash
npm run clean           # Clean build files
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. "MySQL is not installed" Error
```bash
# macOS
brew install mysql
brew services start mysql

# Linux
sudo apt install mysql-server
sudo systemctl start mysql

# Windows
# Download and install from mysql.com
```

#### 2. "Access denied" Error
- Check your MySQL password in environment file
- Reset MySQL root password if needed:
  ```bash
  # macOS
  mysql_secure_installation
  
  # Linux
  sudo mysql_secure_installation
  ```

#### 3. "Database doesn't exist" Error
```bash
npm run setup:local-db
```

#### 4. "ECONNREFUSED" Error
```bash
# Check if MySQL is running
brew services list  # macOS
sudo systemctl status mysql  # Linux

# Start MySQL if not running
brew services start mysql  # macOS
sudo systemctl start mysql  # Linux
```

#### 5. "Module not found" Error
```bash
npm install
```

#### 6. "Port already in use" Error
```bash
# Find and kill the process using port
lsof -ti:2000 | xargs kill -9  # Development
lsof -ti:3000 | xargs kill -9  # Staging
lsof -ti:8080 | xargs kill -9  # Production

# Or change the port in environment file
PORT=3001
```

#### 7. "Environment file not found" Error
```bash
# Create environment files
cp .env.example .env.development
cp .env.example .env.staging
cp .env.example .env.production
# Then update with your credentials
```

#### 8. "Missing required environment variable: database.password" Error
This error occurs in development when the local MySQL password is empty. This is normal for development environments where MySQL is installed without a password.

**Solution:**
- Ensure your `.env.development` file has `LOCAL_MYSQL_PASSWORD=` (empty value)
- Or set a password for your local MySQL and update the environment file
- The validation allows empty passwords in development mode only

### Getting Help

If you encounter issues:

1. **Check this guide first**
2. **Look at the error message** in the console
3. **Contact your team lead** with:
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
3. **Work locally** - Use local database for development, RDS only for sync
4. **Report issues** - If you can't connect, check with team lead about IP whitelisting
5. **Environment awareness** - Always check which environment you're running

## 🌐 Network Access

### Local Development:
- No network access needed for local MySQL
- Works offline

### Staging/Production RDS Access:
- Only needed when syncing data or deploying
- Your IP must be whitelisted in RDS security group

### Adding IP to RDS Security Group:
1. Go to AWS RDS Console
2. Select your database instance
3. Go to "Connectivity & security" tab
4. Click on the Security Group
5. Add inbound rule for MySQL (port 3306) with your IP

## 🎯 Development Workflow

1. **Setup**: Install MySQL and run `npm run setup:local-db`
2. **Develop**: Work with local database using `npm run dev`
3. **Test**: Ensure everything works locally
4. **Staging**: Deploy to staging with `npm run dev:staging`
5. **Production**: Deploy to production with `npm start`
6. **Sync**: Use `npm run sync:db:push` to deploy changes

## 🔄 Database Changes

If you need to make database schema changes:
1. Discuss with the team first
2. Update the SQL script in `scripts/setupLocalDatabase.sql`
3. Test changes locally
4. Test changes in staging
5. Coordinate deployment with team lead
6. Document changes for other team members

## 📞 Support

- **Team Lead**: For credentials and access issues
- **This README**: For setup and troubleshooting
- **apiList.md**: For available API endpoints

## 🎯 Benefits of Three-Environment Setup

- **🏠 Development**: Fast local development with no network latency
- **🧪 Staging**: Safe testing environment that mirrors production
- **🚀 Production**: Stable, secure production environment
- **🔒 Security**: Proper isolation between environments
- **🔄 Workflow**: Clear development → staging → production pipeline
- **🐛 Debugging**: Easy to reproduce issues in staging

---

**🎉 Welcome to the team! Happy coding! 🚀** 