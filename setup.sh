#!/bin/bash

echo "🚀 Setting up TinderClone Backend for team development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment files if they don't exist
echo "🔧 Setting up environment files..."

if [ ! -f ".env.development" ]; then
    echo "📝 Creating .env.development from example..."
    if [ -f "env-examples/development.env.example" ]; then
        cp env-examples/development.env.example .env.development
        echo "✅ .env.development created"
        echo "⚠️  Please update .env.development with your local MySQL credentials"
    else
        echo "⚠️  env-examples/development.env.example not found"
    fi
else
    echo "✅ .env.development already exists"
fi

if [ ! -f ".env.staging" ]; then
    echo "📝 Creating .env.staging from example..."
    if [ -f "env-examples/staging.env.example" ]; then
        cp env-examples/staging.env.example .env.staging
        echo "✅ .env.staging created"
        echo "⚠️  Please update .env.staging with your RDS credentials (get from team lead)"
    else
        echo "⚠️  env-examples/staging.env.example not found"
    fi
else
    echo "✅ .env.staging already exists"
fi

if [ ! -f ".env.production" ]; then
    echo "📝 Creating .env.production from example..."
    if [ -f "env-examples/production.env.example" ]; then
        cp env-examples/production.env.example .env.production
        echo "✅ .env.production created"
        echo "⚠️  Please update .env.production with your RDS credentials (get from team lead)"
    else
        echo "⚠️  env-examples/production.env.example not found"
    fi
else
    echo "✅ .env.production already exists"
fi

# Check if MySQL is installed
echo "🗄️  Checking MySQL installation..."
if command -v mysql &> /dev/null; then
    echo "✅ MySQL is installed"
else
    echo "⚠️  MySQL is not installed. Please install MySQL:"
    echo "   macOS: brew install mysql"
    echo "   Linux: sudo apt install mysql-server"
    echo "   Windows: Download from mysql.com"
fi

# Setup local database
echo "🗄️  Setting up local database..."
npm run setup:local-db

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.development with your local MySQL credentials"
echo "2. Update .env.staging with RDS credentials (get from team lead)"
echo "3. Update .env.production with RDS credentials (get from team lead)"
echo "4. Start development: npm run dev"
echo ""
echo "📖 Read TEAM_SETUP.md for detailed instructions"
echo "" 