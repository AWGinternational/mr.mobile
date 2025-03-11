#!/bin/bash

# Wait for MySQL to be available
echo "Waiting for MySQL to start..."
for i in {1..30}; do
    if mysql -u root -pmr_mobile_pass -e "SELECT 1" &> /dev/null; then
        break
    fi
    echo "Waiting for MySQL to be available... ($i/30)"
    sleep 1
done

echo "Creating database..."
mysql -u root -pmr_mobile_pass -e "CREATE DATABASE IF NOT EXISTS sales_stock_db;"

echo "Importing schema..."
mysql -u root -pmr_mobile_pass sales_stock_db < "$(dirname "$0")/../database/migrations/sales_stock_db.sql"

echo "Updating environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "PORT=4000
NODE_ENV=development
SESSION_SECRET=codespace_secret_key
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=mr_mobile_pass
DATABASE_NAME=sales_stock_db" > .env
fi

echo "Database setup complete!"
