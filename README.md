# 🚀 Webhook Ingestion System

A production-ready backend application built using **Node.js, Express.js, PostgreSQL, Redis, Docker, JWT Authentication, Role-Based Access Control (RBAC), and Swagger API Documentation**.

This project demonstrates secure authentication, authorization, webhook handling, API documentation, and containerized deployment.

---

## 📸 Project Preview

### Swagger API Documentation

> Visit after running the project:

```
http://localhost:5000/docs
```

Or, if deployed:

```
http://65.2.81.197:5000/docs

```

---

# ✨ Features

- 🔐 User Registration & Login
- 🔑 JWT Authentication
- 👤 User Profile API
- 🛡 Role-Based Access Control (RBAC)
- 📄 Swagger API Documentation
- 🐘 PostgreSQL Database
- ⚡ Redis Integration
- 🐳 Dockerized Application
- 🚦 Rate Limiting
- 🛡 Helmet Security
- 🌐 CORS Configuration
- 📝 Request Validation using Zod
- 📊 Health Check Endpoint
- 📦 Production Ready Project Structure

---

# 🛠 Tech Stack

| Technology | Usage |
|------------|-------|
| Node.js | Backend Runtime |
| Express.js | REST API Framework |
| PostgreSQL | Database |
| Redis | Caching |
| Docker | Containerization |
| JWT | Authentication |
| Zod | Validation |
| Swagger (OpenAPI) | API Documentation |
| Helmet | Security Headers |
| CORS | Cross-Origin Requests |

---

# 📂 Folder Structure

```text
webhook-ingestion-system
│
├── src
│   ├── config
│   ├── controllers
│   ├── docs
│   ├── logger
│   ├── middleware
│   ├── routes
│   ├── validation
│   ├── server.js
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Abhinav27srivastava/webhook-ingestion-system.git
```

Go inside project

```bash
cd webhook-ingestion-system
```

Install dependencies

```bash
npm install
```

Run project

```bash
npm start
```

---

# 🐳 Docker

Build & Run

```bash
docker compose up --build
```

Stop

```bash
docker compose down
```

---

# 🔑 Environment Variables

Create a `.env` file.

```env
PORT=5000

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

REDIS_HOST=
REDIS_PORT=

JWT_SECRET=
JWT_EXPIRES_IN=
```

---

# 🔐 Authentication

Protected APIs require JWT Token.

Example:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# 📖 API Endpoints

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register User |
| POST | /auth/login | Login User |
| GET | /auth/profile | User Profile |
| GET | /auth/admin | Admin Route |

---

## Health

| Method | Endpoint |
|--------|----------|
| GET | /health |

---

# 📚 Swagger Documentation

After starting the server:

```
http://localhost:5000/docs
```

---

# 🏗 System Architecture

```text
                Client
                   │
                   ▼
          Express REST API
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
 JWT Authentication       Zod Validation
        │
        ▼
 Role Based Access Control
        │
        ▼
 PostgreSQL Database
        │
        ▼
      Redis Cache
```

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Helmet Security
- Rate Limiting
- RBAC Authorization
- Request Validation

---

# 📦 Future Improvements

- Refresh Tokens
- Email Verification
- Password Reset
- BullMQ Background Jobs
- Webhook Retry System
- CI/CD Pipeline
- Kubernetes Deployment
- Monitoring & Logging Dashboard

---

# 👨‍💻 Author

**Abhinav Srivastava**

B.Tech – Information Technology

GitHub:

```
https://github.com/Abhinav27srivastava
```

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.