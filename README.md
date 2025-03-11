# Mr. Mobile - Inventory & Sales Management System

A modern web application for managing mobile phone sales, inventory, and customer interactions.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Running the Project on Windows](#running-the-project-on-windows)
- [Project Features](#project-features)
- [Available Scripts](#available-scripts)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [GitHub Codespaces](#github-codespaces)
- [Setting Up Database in GitHub Codespaces](#setting-up-database-in-github-codespaces)

## Prerequisites

Before running this project, ensure you have:

- [Node.js](https://nodejs.org/en/download/) v16 or newer
- [MySQL](https://dev.mysql.com/downloads/installer/) installed and running
- A code editor (VS Code recommended)
- Git installed

## Running the Project on Windows

Follow these steps to run the project on Windows:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/mr-mobile.git
cd mr-mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Database
- Open MySQL Workbench or command line
- Create a new database:
```sql
CREATE DATABASE mr_mobile_db;
```
- Import the database schema (if available):
```bash
mysql -u your_username -p mr_mobile_db < database/schema.sql
```

### 4. Configure Environment Variables
- Create a file named `.env` in the project root
- Add the following environment variables:
```env
PORT=4000
NODE_ENV=development
SESSION_SECRET=your_secret_key
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=mr_mobile_db
```

> Replace `your_secret_key` and `your_password` accordingly.

### 5. Start the Development Server
```bash
npm start
```

### 6. Start with Nodemon (for auto-restart on file changes)
```bash
npm run dev
```

## Project Features

- **Secure Express.js Server** with best practices.
- **API Endpoints** for managing different business entities.
- **Session Management** using `express-session` and Redis.
- **Security Enhancements** with `helmet`, `csurf`, and `express-rate-limit`.
- **Logging & Monitoring** using `morgan`.
- **Database Integration** with MySQL via `mysql2`.
- **Email Support** using `nodemailer`.

## Available Scripts

### Start the Development Server
```bash
npm start
```

### Start with Nodemon (for auto-restart on file changes)
```bash
npm run dev
```

## GitHub Actions CI/CD

This project uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD). The configuration file is located in `.github/workflows/ci.yml`.

## GitHub Codespaces

You can use GitHub Codespaces to develop this project in a cloud-based environment. The configuration file is located in `.devcontainer/devcontainer.json`.

## Setting Up Database in GitHub Codespaces

When using GitHub Codespaces, you can automatically set up the database using the SQL file provided in the repository.

### Automatic Setup with Codespaces

1. When you open the project in Codespaces, the MySQL server will be automatically installed and started as part of the dev container setup.

2. To import your database schema automatically:

```bash
# Navigate to the project root
cd /workspaces/mr-mobile

# Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sales_stock_db;"

# Import the SQL file
mysql -u root -p sales_stock_db < database/migrations/sales_stock_db.sql
```

3. The application should now be able to connect to the database.

### Manual Database Setup in Codespaces

If the automatic setup doesn't work, you can manually set up the database:

1. Start MySQL service:
```bash
sudo service mysql start
```

2. Connect to MySQL:
```bash
mysql -u root -p
```

3. Create the database:
```sql
CREATE DATABASE sales_stock_db;
USE sales_stock_db;
```

4. Import the schema:
```bash
exit;
mysql -u root -p sales_stock_db < database/migrations/sales_stock_db.sql
```

5. Update the application's environment variables to point to this database:
```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=sales_stock_db
```

### Automating Database Setup for Codespaces

To fully automate the database setup process when a codespace is created, add this to your .devcontainer/devcontainer.json file:

```json
{
  "name": "Mr. Mobile Node.js",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:16",
  "features": {
    "ghcr.io/devcontainers/features/mysql:1": {
      "version": "8.0"
    }
  },
  "forwardPorts": [4000, 3306],
  "postCreateCommand": "bash .devcontainer/setup-db.sh && npm install",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "cweijan.vscode-mysql-client2"
      ]
    }
  }
}
```

Then create a setup script at `.devcontainer/setup-db.sh`:

```bash
#!/bin/bash
echo "Starting MySQL..."
sudo service mysql start

echo "Waiting for MySQL to start..."
sleep 5

echo "Creating database..."
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS sales_stock_db;"

echo "Importing schema..."
mysql -u root -proot sales_stock_db < database/migrations/sales_stock_db.sql

echo "Database setup complete!"
```

Make the script executable:

```bash
chmod +x .devcontainer/setup-db.sh
```

Now when someone creates a new codespace, the database will be automatically set up!

## API Endpoints

| Method | Endpoint        | Description        |
| ------ | --------------- | ------------------ |
| GET    | `/api/products` | Fetch all products |
| GET    | `/api/sales`    | Fetch all sales    |
| GET    | `/suppliers`    | Fetch suppliers    |
| GET    | `/categories`   | Fetch categories   |
| GET    | `/api/users`    | Fetch users        |
| GET    | `/customers`    | Fetch customers    |
| GET    | `/giveloans`    | Fetch given loans  |
| GET    | `/inventory`    | Fetch inventory    |

## Project Structure

```
mr.mobile/
│-- database/            # Database-related files
│-- public/              # Public assets
│-- src/
│   ├── routes/          # Express route handlers
│   ├── controllers/     # Business logic for routes
│   ├── models/          # Database models
│   ├── middlewares/     # Custom middleware functions
│   ├── config/          # Configuration files
│-- .env                 # Environment variables
│-- .gitignore           # Files to be ignored by Git
│-- package.json         # Project dependencies and scripts
│-- server.js            # Main entry point
```

## Security & Best Practices

- **Helmet**: Secures HTTP headers.
- **Rate Limiting**: Limits requests per IP.
- **Session Handling**: Secure cookies and Redis support.
- **CORS**: Cross-origin request support.

## Troubleshooting

### Common Issues & Solutions

1. **Port already in use?**

   ```sh
   kill $(lsof -t -i:4000)
   ```

   Or change the port in `.env` file.

2. **Database connection issues?**

   - Ensure MySQL is running and credentials in `.env` are correct.

3. **Session storage errors?**

   - Ensure Redis is running and properly configured.

## License

This project is licensed under the AWG\_international License.


