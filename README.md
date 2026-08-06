# 🚀 Webhook Ingestion System

A production-ready **Webhook Ingestion System** built using **Node.js, Express.js, PostgreSQL, Redis, BullMQ, Docker, JWT Authentication, Role-Based Access Control (RBAC), Swagger, and Bull Board**.

The application receives webhook events from external services, validates incoming payloads, stores them in PostgreSQL, queues them using BullMQ, processes them asynchronously with Redis-backed workers, retries failed jobs automatically, and moves permanently failed jobs to a **Dead Letter Queue (DLQ)**.

---

# 🌐 Live Demo

## Swagger API Documentation

```
http://65.2.81.197:5000/docs

```

## Bull Board Dashboard

```
http://65.2.81.197:5000/admin/queues
```


---

# 📌 Project Overview

Modern applications receive webhook events from services like:

- Stripe
- GitHub
- Razorpay
- Slack
- Discord
- Shopify

Processing webhook requests synchronously can slow down the application.

This project solves the problem using an asynchronous architecture powered by **BullMQ** and **Redis**.

Incoming events are:

- Validated
- Stored
- Queued
- Processed asynchronously
- Retried automatically
- Moved to a Dead Letter Queue if all retries fail

---

# 🏗 Architecture

```text
                Third Party Service
          (Stripe / GitHub / Razorpay)

                     │
                     ▼

              POST /webhook

                     │
                     ▼

             Payload Validation
                 (Zod Schema)

                     │
                     ▼

          Store Event (PostgreSQL)

                     │
                     ▼

          BullMQ Queue (Redis)

                     │
                     ▼

          Background Worker

          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼

     Success             Retry (3 Attempts)

                                 │
                                 ▼

                    Dead Letter Queue (DLQ)

                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼

        GET /webhook/failed        POST /webhook/retry/:jobId
```

---

# ✨ Features

## Webhook Processing

- Receive webhook events
- Payload validation using Zod
- Store events in PostgreSQL
- Queue events using BullMQ
- Redis-backed message queue
- Background worker processing
- Automatic retry mechanism
- Dead Letter Queue (DLQ)
- Retry failed webhook jobs
- Queue monitoring using Bull Board

---

## Authentication & Security

- JWT Authentication
- Role-Based Access Control (RBAC)
- Password Hashing (bcrypt)
- Helmet Security
- Rate Limiting
- CORS Protection

---

## API Documentation

- Swagger (OpenAPI 3.0)
- Interactive API Testing
- Bearer Token Authentication
- Example Request & Response

---

## Monitoring

- Bull Board Dashboard
- Queue Monitoring
- Failed Jobs Monitoring
- Retry Failed Jobs

---

# 🛠 Tech Stack

| Technology | Purpose |
|------------|----------|
| Node.js | Runtime |
| Express.js | REST API |
| PostgreSQL | Database |
| Redis | Queue Backend |
| BullMQ | Background Job Processing |
| Bull Board | Queue Monitoring |
| Docker | Containerization |
| JWT | Authentication |
| Zod | Request Validation |
| Swagger | API Documentation |
| Helmet | Security |
| Rate Limiter | API Protection |

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
│   ├── queue
│   ├── workers
│   ├── routes
│   ├── validation
│   └── server.js
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 🚀 Getting Started

Clone the repository

```bash
git clone https://github.com/Abhinav27srivastava/webhook-ingestion-system.git
```

Go into project

```bash
cd webhook-ingestion-system
```

Install dependencies

```bash
npm install
```

Run the application

```bash
npm start
```

---

# 🐳 Docker

Build and start containers

```bash
docker compose up --build
```

Stop containers

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

FRONTEND_URL=
```

---

# 📖 API Endpoints

## Authentication

| Method | Endpoint | Description |
|----------|----------|-------------|
| POST | /auth/register | Register User |
| POST | /auth/login | Login User |
| GET | /auth/profile | Get User Profile |
| GET | /auth/admin | Admin Only Route |

---

## Webhook

| Method | Endpoint | Description |
|----------|----------|-------------|
| POST | /webhook | Receive Webhook |
| GET | /webhook/failed | Retrieve Failed Jobs (DLQ) |
| POST | /webhook/retry/:jobId | Retry Failed Job |

---

## Health

| Method | Endpoint |
|----------|----------|
| GET | /health |

---

# 📚 Swagger Documentation

Local

```
http://localhost:5000/docs
```

Production

```
http://65.2.81.197:5000/docs
```

---

# 📊 Bull Board Dashboard

Local

```
http://localhost:5000/admin/queues
```

Production

```
http://65.2.81.197:5000/admin/queues
```

---

# 🔄 Webhook Flow

```text
Incoming Webhook
       │
       ▼
Validate Request
       │
       ▼
Store in PostgreSQL
       │
       ▼
Add Job to BullMQ Queue
       │
       ▼
Worker Processes Job
       │
 ┌─────┴─────┐
 │           │
 ▼           ▼

Success   Retry (3 Attempts)

             │
             ▼

     Dead Letter Queue

             │
      Retry Failed Job
```

---

# 🔒 Security Features

- JWT Authentication
- Role-Based Access Control
- Password Hashing
- Helmet Security
- API Rate Limiting
- Request Validation (Zod)

---

# 🚀 Future Improvements

- Webhook Signature Verification (Stripe/GitHub)
- Queue Metrics API
- Email Notifications
- Prometheus & Grafana Monitoring
- Kubernetes Deployment
- CI/CD Pipeline
- Horizontal Worker Scaling

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

If you found this project useful, please consider giving it a ⭐ on GitHub.