#!/bin/bash

# PostgreSQL Setup Script for Symposic MVP
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Navigate to project root (two levels up from scripts directory)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

source .env
if [ -z "$DB_USER" ]; then
    echo "DB_USER is not set. Check that .env file is configured"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Installing..."
    
    # Detect OS and install PostgreSQL
    if [ -f /etc/os-release ] && grep -q -E "Ubuntu|Debian" /etc/os-release; then
        # Ubuntu/Debian
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
    else
        echo "❌ Unsupported OS. Please install PostgreSQL manually."
        exit 1
    fi
fi

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Create database if it doesn't exist
echo "Creating database '$DB_NAME' if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database '$DB_NAME' already exists or created successfully"

# Run schema
echo "Setting up database schema..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f ./db/schema.sql
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f ./db/seed.sql

echo "✅ PostgreSQL setup complete!"
echo "Connection string: postgres://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
echo ""
echo "To test the connection, run:"
echo "  cd backend && npm run test:db"
