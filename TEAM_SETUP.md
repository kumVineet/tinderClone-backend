# 🚀 Team Setup Guide - Hybrid Database Architecture

## 📋 Overview

This project uses a **hybrid database approach**:
- **Development**: Each developer uses local MySQL
- **Staging**: Shared RDS instance for testing
- **Production**: Dedicated RDS instance for live deployment

## 🏗️ Architecture

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

## 🛠️ Setup Instructions

### **For Each Team Member**

#### 1. **Prerequisites**
```bash
# Install MySQL locally
# macOS
brew install mysql
brew services start mysql
brew install --cask mysqlworkbench

# Windows
# Download from mysql.com

# Linux
sudo apt install mysql-server
sudo systemctl start mysql
```

#### 2. **Project Setup**
```bash
# Clone the project
git clone <your-repo-url>
cd tinderClone-backend

# Install dependencies
npm install

# Run setup script
./setup.sh
```

#### 3. **Environment Configuration**

**Copy environment files:**
```bash
cp .env.development.example .env.development
cp .env.staging.example .env.staging
cp .env.production.example .env.production
```

**Update `.env.development` (Local MySQL):**
```env
# Local MySQL Configuration
LOCAL_MYSQL_HOST=localhost
LOCAL_MYSQL_USER=root
LOCAL_MYSQL_PASSWORD=your_local_password
LOCAL_MYSQL_DATABASE=tinderClone_local
LOCAL_MYSQL_CONNECTION_LIMIT=10
LOCAL_MYSQL_QUEUE_LIMIT=0

# Other configurations...
JWT_SECRET=your_dev_secret
FRONTEND_URL=http://localhost:3000
```

**Update `.env.staging` (Shared RDS):**
```env
# Staging RDS Configuration (get from team lead)
STAGING_MYSQL_HOST=your-staging-rds-endpoint.amazonaws.com
STAGING_MYSQL_USER=staging_user
STAGING_MYSQL_PASSWORD=staging_password
STAGING_MYSQL_DATABASE=tinderClone_staging
STAGING_MYSQL_CONNECTION_LIMIT=20
STAGING_MYSQL_QUEUE_LIMIT=0

# Other configurations...
JWT_SECRET=your_staging_secret
FRONTEND_URL=https://staging.yourapp.com
```

**Update `.env.production` (Production RDS):**
```env
# Production RDS Configuration (get from team lead)
PRODUCTION_MYSQL_HOST=your-production-rds-endpoint.amazonaws.com
PRODUCTION_MYSQL_USER=prod_user
PRODUCTION_MYSQL_PASSWORD=prod_password
PRODUCTION_MYSQL_DATABASE=tinderClone_production
PRODUCTION_MYSQL_CONNECTION_LIMIT=50
PRODUCTION_MYSQL_QUEUE_LIMIT=0

# Other configurations...
JWT_SECRET=your_production_secret
FRONTEND_URL=https://yourapp.com
```

#### 4. **Setup Local Database**
```bash
# Setup local MySQL database
npm run setup:local-db

# This creates:
# - Database: tinderClone_local
# - Tables: users, connection_requests
# - Sample data for development
```

#### 5. **Start Development**
```bash
# Start development server (uses local MySQL)
npm run dev

# You should see: "SQL Database connected..."
```

## 🔄 Development Workflow

### **Daily Development**
```bash
# Always use development environment
npm run dev

# This connects to your local MySQL
# Fast, offline, no network dependency
```

### **Testing with Staging Data**
```bash
# Pull latest data from staging RDS
npm run sync:db:pull

# This updates your local database with staging data
# Useful for testing with real data
```

### **Pushing Changes to Staging**
```bash
# After testing locally, push schema changes
npm run sync:db:push

# This updates staging RDS with your local schema
# Use carefully - can overwrite staging data
```

### **Running Staging Environment**
```bash
# Test against staging RDS
npm run dev:staging

# This connects to staging RDS
# Use for final testing before production
```

## 🗄️ Database Management

### **Local Development**
- **Database**: `tinderClone_local`
- **Location**: Your local machine
- **Speed**: Very fast (no network)
- **Data**: Your own test data
- **Safety**: Can't break team data

### **Using MySQL Workbench (GUI)**
After installing MySQL Workbench, you can:
1. **Connect to your local database**:
   - Host: `localhost`
   - User: `root`
   - Password: (your local MySQL password)
   - Port: `3306`

2. **View and manage your data**:
   - Browse tables visually
   - Run SQL queries
   - Edit data directly
   - Export/import data
   - Design database schemas

3. **Useful for development**:
   - Check if tables are created correctly
   - Verify sample data
   - Debug database issues
   - Test SQL queries

### **Staging Environment**
- **Database**: `tinderClone_staging`
- **Location**: Shared RDS instance
- **Speed**: Network dependent
- **Data**: Shared test data
- **Safety**: Team can see your changes

### **Production Environment**
- **Database**: `tinderClone_production`
- **Location**: Dedicated RDS instance
- **Speed**: Network dependent
- **Data**: Live user data
- **Safety**: Very restricted access

## 🔧 Useful Commands

```bash
# Development (Local MySQL)
npm run dev                    # Start development server
npm run setup:local-db         # Setup local database
npm run db:reset              # Reset local database

# Staging (RDS)
npm run dev:staging           # Start staging server
npm run sync:db:pull         # Pull data from staging
npm run sync:db:push         # Push schema to staging

# Production (RDS)
npm run dev:prod             # Start production server (local)
npm start                    # Start production server (built)

# Building
npm run build:dev           # Build for development
npm run build:staging       # Build for staging
npm run build:prod          # Build for production
```

## 🚨 Important Notes

### **Security**
- Never commit `.env.*` files to git
- Use different JWT secrets for each environment
- Keep RDS credentials secure
- Use strong passwords for local MySQL

### **Data Management**
- Local development data is separate from staging/production
- Use `sync:db:pull` to get fresh staging data
- Use `sync:db:push` carefully - can overwrite staging data
- Always backup before major schema changes

### **Team Coordination**
- Coordinate schema changes with team
- Test locally before pushing to staging
- Use staging for integration testing
- Only deploy to production after staging approval

## 🆘 Troubleshooting

### **Local MySQL Issues**
```bash
# Start MySQL service
brew services start mysql  # macOS
sudo systemctl start mysql # Linux

# Reset local database
npm run db:reset

# Check MySQL connection
mysql -u root -p
```

### **RDS Connection Issues**
```bash
# Check network connectivity
ping your-rds-endpoint.amazonaws.com

# Check security groups
# Ensure your IP is whitelisted in RDS security group

# Test connection
mysql -h your-rds-endpoint -u username -p
```

### **Environment Issues**
```bash
# Check environment variables
echo $NODE_ENV

# Verify .env file exists
ls -la .env.development

# Test configuration
npm run dev
```

## 📞 Team Lead Responsibilities

1. **RDS Management**
   - Create and manage RDS instances
   - Share credentials securely with team
   - Monitor usage and costs
   - Backup and restore data

2. **Environment Coordination**
   - Coordinate schema changes
   - Review staging deployments
   - Manage production releases
   - Monitor application health

3. **Team Support**
   - Help with setup issues
   - Coordinate database migrations
   - Manage access permissions
   - Provide training and documentation

---

**🎉 You're all set! Happy coding!** 