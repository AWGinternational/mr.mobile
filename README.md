# mr.mobile
# FYP Final Project

## Overview

This project is a backend server built using **Node.js** and **Express.js** for managing various business operations, including products, sales, inventory, users, suppliers, customers, loans, commissions, and reports. It also implements security features such as **helmet, rate limiting, session handling, CORS, and response compression**.

---

## Features

- **Secure Express.js Server** with best practices.
- **API Endpoints** for managing different business entities.
- **Session Management** using `express-session` and Redis.
- **Security Enhancements** with `helmet`, `csurf`, and `express-rate-limit`.
- **Logging & Monitoring** using `morgan`.
- **Database Integration** with MySQL via `mysql2`.
- **Email Support** using `nodemailer`.

---

## Installation

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [MySQL](https://www.mysql.com/) Database
- [Redis](https://redis.io/) (for session storage, optional)

### Clone the Repository

```sh
git clone git@github.com:AWGinternational/mr.mobile.git
cd mr.mobile
```

### Install Dependencies

```sh
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=4000
NODE_ENV=development
SESSION_SECRET=your_secret_key
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=fypdb
```

> Replace `your_secret_key` and `your_password` accordingly.

---

## Running the Project

### Start the Development Server

```sh
npm start
```

### Start with Nodemon (for auto-restart on file changes)

```sh
npm run dev
```

---

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

---

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

---

## Security & Best Practices

- **Helmet**: Secures HTTP headers.
- **Rate Limiting**: Limits requests per IP.
- **Session Handling**: Secure cookies and Redis support.
- **CORS**: Cross-origin request support.

---

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

---

## License

This project is licensed under the AWG\_international License.


