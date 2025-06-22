# 🏗️ TinderClone Backend Architecture Guide

A comprehensive guide to the technical architecture of the TinderClone backend system.

## 🎯 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        TinderClone Backend                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Development │  │   Staging   │  │ Production  │            │
│  │   Port:2000 │  │  Port:3001  │  │  Port:8080  │            │
│  │ /api/dev    │  │/api/staging │  │   /api      │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                    Amazon RDS MySQL Databases                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   RDS Dev   │  │ RDS Staging │  │  RDS Prod   │            │
│  │tinderClone_ │  │tinderClone_ │  │tinderBackend│            │
│  │    dev      │  │  staging    │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 🏛️ Application Architecture

### **Technology Stack**
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: MySQL 8.0+ (Amazon RDS)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Connection Pooling**: mysql2/promise
- **CORS**: Cross-Origin Resource Sharing enabled
- **Environment Management**: dotenv with environment-specific configs

### **Project Structure**
```
src/
├── config/                 # Configuration management
│   ├── environment.ts     # Environment-specific settings
│   ├── databaseConfig.ts  # Database connection configuration
│   └── mysql.ts          # MySQL connection pool
├── middlewares/           # Express middlewares
│   └── auth.ts           # JWT authentication middleware
├── models/               # Database models
│   ├── userSQL.ts        # User data operations
│   └── connectionRequestSQL.ts # Connection request operations
├── Routes/               # API route handlers
│   ├── authRouter.ts     # Authentication endpoints
│   ├── profileRouter.ts  # Profile management
│   ├── userRouter.ts     # User operations
│   ├── requestsRouter.ts # Connection requests
│   └── environmentRouter.ts # System info endpoints
├── types/                # TypeScript type definitions
│   └── index.ts         # Shared interfaces and types
├── utils/                # Utility functions
│   └── validations.ts   # Input validation
└── App.ts               # Main application entry point
```

## 🗄️ Database Architecture

### **Database Schema Design**

#### **Users Table**
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('male', 'female', 'others'),
    about TEXT,
    photo VARCHAR(500) DEFAULT 'https://www.w3schools.com/howto/img_avatar.png',
    skills JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_gender (gender),
    INDEX idx_created_at (createdAt)
);
```

#### **Connection Requests Table**
```sql
CREATE TABLE connection_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fromUserId INT NOT NULL,
    toUserId INT NOT NULL,
    fromUserName VARCHAR(255),
    toUserName VARCHAR(255),
    status ENUM('ignore', 'accepted', 'rejected', 'interested') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_request (fromUserId, toUserId),
    INDEX idx_status (status),
    INDEX idx_from_user (fromUserId),
    INDEX idx_to_user (toUserId),
    INDEX idx_created_at (createdAt)
);
```

### **Database Connection Architecture**

#### **Connection Pool Configuration**
```typescript
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  connectionLimit: config.database.connectionLimit,
  queueLimit: config.database.queueLimit,
  waitForConnections: true,
  charset: 'utf8mb4',
});
```

#### **Environment-Specific Connection Limits**
- **Development**: 10 connections
- **Staging**: 20 connections  
- **Production**: 50 connections

### **Data Flow Architecture**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│   Express   │───▶│   MySQL     │
│  (Frontend) │    │  Middleware │    │   Database  │
└─────────────┘    └─────────────┘    └─────────────┘
                        │
                        ▼
                ┌─────────────┐
                │   JWT Auth  │
                │  Validation │
                └─────────────┘
                        │
                        ▼
                ┌─────────────┐
                │   Business  │
                │   Logic     │
                └─────────────┘
                        │
                        ▼
                ┌─────────────┐
                │   Database  │
                │   Models    │
                └─────────────┘
```

## 🔐 Security Architecture

### **Authentication Flow**
1. **Registration**: User signs up → Password hashed with bcrypt → User stored in database
2. **Login**: User credentials validated → JWT token generated → Token returned to client
3. **Authorization**: JWT token validated on each request → User context attached to request

### **Security Layers**
```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│ 1. CORS Protection (Origin validation)                  │
│ 2. Input Validation (Request sanitization)              │
│ 3. JWT Authentication (Token-based auth)                │
│ 4. Password Hashing (bcrypt with salt)                  │
│ 5. Database Connection Pooling (Connection management)  │
│ 6. Environment Isolation (Separate configs)             │
│ 7. Rate Limiting (Production/Staging)                   │
└─────────────────────────────────────────────────────────┘
```

### **Environment-Specific Security**
- **Development**: Debug logging, no rate limiting
- **Staging**: Info logging, rate limiting enabled
- **Production**: Warn logging, full security measures

## 🔄 API Architecture

### **RESTful API Design**
```
/api/{environment}/
├── /auth
│   ├── POST /signup     # User registration
│   ├── POST /login      # User authentication
│   └── POST /logout     # User logout
├── /profile
│   ├── GET  /view       # Get user profile
│   ├── PATCH /edit      # Update profile
│   └── PATCH /password  # Update password
├── /users
│   ├── GET /feed        # Get user feed
│   ├── GET /request     # Get connection requests
│   └── GET /connections # Get accepted connections
├── /requests
│   ├── POST /send/:status/:toUserId    # Send connection request
│   └── POST /review/:status/:requestId # Review connection request
└── /info
    ├── GET /            # Environment information
    ├── GET /health      # Health check
    ├── GET /status      # System status
    └── GET /db-health   # Database health check
```

### **Request/Response Flow**
```
Client Request
    │
    ▼
┌─────────────┐
│   CORS      │ ← Origin validation
└─────────────┘
    │
    ▼
┌─────────────┐
│ Validation  │ ← Input sanitization
└─────────────┘
    │
    ▼
┌─────────────┐
│   Auth      │ ← JWT token validation
└─────────────┘
    │
    ▼
┌─────────────┐
│ Business    │ ← Application logic
│ Logic       │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Database    │ ← Data operations
│ Models      │
└─────────────┘
    │
    ▼
Client Response
```

## 🏗️ Multi-Environment Architecture

### **Environment Isolation Strategy**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ • Port: 2000    │    │ • Port: 3001    │    │ • Port: 8080    │
│ • API: /api/dev │    │ • API: /api/    │    │ • API: /api     │
│ • DB: RDS Dev   │    │   staging       │    │ • DB: RDS Prod  │
│ • Log: Debug    │    │ • DB: RDS Stag  │    │ • Log: Warn     │
│ • Rate: None    │    │ • Log: Info     │    │ • Rate: Full    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Environment Configuration Management**
```typescript
interface EnvironmentConfig {
  // Server Configuration
  port: number;
  nodeEnv: string;
  
  // API Configuration
  apiBaseUrl: string;
  apiVersion: string;
  apiPrefix: string;
  
  // Database Configuration
  database: {
    host: string;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
    queueLimit: number;
  };
  
  // Security Configuration
  jwtSecret: string;
  jwtExpiresIn: string;
  corsEnabled: boolean;
  rateLimitEnabled: boolean;
}
```

## 🔧 Error Handling Architecture

### **Database Connection Resilience**
```typescript
// Retry logic with exponential backoff
const maxRetries = 3;
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // Database operation
    return result;
  } catch (error) {
    if (isConnectionError(error) && attempt < maxRetries) {
      await delay(Math.pow(2, attempt) * 1000);
      continue;
    }
    throw error;
  }
}
```

### **Error Response Structure**
```typescript
interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  timestamp: string;
  path: string;
}
```

## 📊 Monitoring Architecture

### **Health Check Endpoints**
- **Basic Health**: `/api/{env}/info/health`
- **Database Health**: `/api/{env}/info/db-health`
- **System Status**: `/api/{env}/info/status`
- **Environment Info**: `/api/{env}/info`

### **Database Monitoring**
```typescript
// Connection pool monitoring
pool.on('connection', (connection) => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});
```

## 🚀 Scalability Considerations

### **Horizontal Scaling**
- **Stateless Design**: No session storage, JWT-based authentication
- **Database Connection Pooling**: Efficient connection management
- **Environment Isolation**: Independent scaling per environment

### **Performance Optimizations**
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Reuse database connections
- **Input Validation**: Early rejection of invalid requests
- **CORS Optimization**: Preflight request handling

### **Future Scalability**
- **Microservices Ready**: Modular architecture for service decomposition
- **Load Balancer Compatible**: Stateless design supports load balancing
- **Database Sharding Ready**: Connection pooling supports multiple databases
- **Caching Layer Ready**: Architecture supports Redis/Memcached integration

## 🔄 Data Flow Patterns

### **User Registration Flow**
```
1. Client → POST /api/{env}/auth/signup
2. Validation → Input sanitization
3. Password Hash → bcrypt(password, 10)
4. Database → INSERT INTO users
5. Response → Success/Error message
```

### **Profile Update Flow**
```
1. Client → PATCH /api/{env}/profile/edit
2. Auth → JWT validation
3. Validation → Input sanitization
4. Database → UPDATE users (with retry logic)
5. Response → Updated profile data
```

### **Connection Request Flow**
```
1. Client → POST /api/{env}/requests/send/:status/:toUserId
2. Auth → JWT validation
3. Validation → Check user exists, no duplicate requests
4. Database → INSERT INTO connection_requests
5. Response → Request confirmation
```

## 🎯 Architecture Benefits

- **🔒 Security**: Multi-layered security with environment isolation
- **📈 Scalability**: Stateless design with connection pooling
- **🛡️ Reliability**: Retry logic and error handling
- **🔧 Maintainability**: Modular structure with clear separation
- **🧪 Testability**: Environment isolation enables safe testing
- **📊 Monitoring**: Comprehensive health check endpoints
- **🔄 Flexibility**: Easy to add new environments or features

---

**🏗️ This architecture provides a solid foundation for a scalable, secure, and maintainable backend system.** 