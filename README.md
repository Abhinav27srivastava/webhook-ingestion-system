# 🚀 Webhook Ingestion System

A production-ready **Webhook Ingestion System** built using **Node.js, Express.js, PostgreSQL, Redis, BullMQ, Docker, JWT Authentication, Role-Based Access Control (RBAC), Swagger, Bull Board, and Resend**.

The system is designed to reliably receive webhook events from external services, authenticate and validate incoming requests, persist events in PostgreSQL, queue them using BullMQ, process them asynchronously using a Redis-backed worker, automatically send email notifications, retry failed jobs, and move permanently failed jobs to a **Dead Letter Queue (DLQ)**.

The application is deployed in production using **Render**.

---

# 🌐 Production

## Production API

```text
https://webhook-ingestion-system.onrender.com
Swagger API Documentation
https://webhook-ingestion-system.onrender.com/docs
Webhook Endpoint
https://webhook-ingestion-system.onrender.com/webhook
Health Check
https://webhook-ingestion-system.onrender.com/health
Bull Board Dashboard
https://webhook-ingestion-system.onrender.com/admin/queues

Bull Board is protected using authentication.

📌 Project Overview

Webhooks are commonly used by services such as:

Stripe
GitHub
Razorpay
Slack
Discord
Shopify

When an event occurs, an external service sends an HTTP request to the application's webhook endpoint.

Processing the webhook synchronously can increase response time and make the system less reliable when downstream operations fail.

This project solves the problem using an asynchronous webhook processing architecture.

The system:

Receives the webhook
Verifies the webhook signature
Protects against replay attacks
Validates the payload
Stores the event in PostgreSQL
Adds a job to BullMQ
Processes the job asynchronously using a worker
Automatically sends an email notification
Retries failed jobs
Moves permanently failed jobs to the Dead Letter Queue
🏗️ System Architecture
                         ┌──────────────────────┐
                         │   External Service   │
                         │ Stripe / GitHub etc. │
                         └──────────┬───────────┘
                                    │
                                    │ POST /webhook
                                    ▼
                         ┌──────────────────────┐
                         │     Express API      │
                         │                      │
                         │ • Rate Limiting      │
                         │ • HMAC Verification  │
                         │ • Replay Protection  │
                         │ • Zod Validation     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │                      │
                         │  Webhook Event Store │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Redis + BullMQ    │
                         │                      │
                         │      Job Queue       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Webhook Worker     │
                         │                      │
                         │ Async Job Processing  │
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴───────────┐
                         │                      │
                         ▼                      ▼
                ┌─────────────────┐    ┌─────────────────┐
                │     Resend      │    │    PostgreSQL   │
                │                 │    │                 │
                │ Email Notify    │    │ Status Update   │
                └─────────────────┘    └─────────────────┘
                         │
                         │ On Failure
                         ▼
                ┌─────────────────────┐
                │ Automatic Retries   │
                │      3 Attempts     │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │ Dead Letter Queue   │
                │        DLQ          │
                └─────────────────────┘
✨ Key Features
🔔 Webhook Processing
Receive webhook events through REST API
HMAC-SHA256 signature verification
Timestamp-based replay attack protection
Raw request body preservation
Request validation using Zod
PostgreSQL event persistence
Event ID based idempotency
Duplicate webhook detection
BullMQ asynchronous job processing
Automatic retries
Dead Letter Queue
Failed job retry functionality
🔐 Authentication & Security
JWT Authentication
Role-Based Access Control (RBAC)
Password hashing using bcrypt
HMAC-SHA256 webhook authentication
Timing-safe signature comparison
Timestamp-based replay protection
Helmet security middleware
CORS configuration
API rate limiting
Environment-based secret management
📧 Automatic Email Notifications

The system automatically sends an email notification whenever a webhook event is successfully processed.

Email notifications are handled asynchronously by the BullMQ background worker using Resend.

Notification Flow
Incoming Webhook
       │
       ▼
PostgreSQL
       │
       ▼
BullMQ Queue
       │
       ▼
Webhook Worker
       │
       ▼
Webhook Processing
       │
       ▼
Resend Email Service
       │
       ▼
📧 Automatic Email Notification
       │
       ▼
PostgreSQL
status = processed
Email Configuration

The notification service uses:

RESEND_API_KEY=your_resend_api_key
NOTIFICATION_EMAIL=your_email@example.com

The email is automatically sent to the address configured in NOTIFICATION_EMAIL.

Email Contents

Each notification contains:

Webhook Event ID
Event information
Complete webhook payload

Example:

Subject:
Webhook Event Received: evt-production-test-005

Webhook Event Received

Event ID: evt-production-test-005

Payload:

{
  "id": "evt-production-test-005",
  "type": "resource.created",
  "timestamp": 1788091063,
  "data": {
    "resourceId": "res-production-001"
  }
}
Automatic Notification Behavior

The email is sent by the background worker after the webhook job is picked up from BullMQ.

Example successful worker logs:

Processing webhook event evt-production-test-005

RESEND DATA: { id: "..." }
RESEND ERROR: null

Notification email sent for webhook evt-production-test-005

Webhook event 6 processed successfully

After successful email processing, the webhook event is marked as:

processed

If email sending fails, the worker throws an error and BullMQ automatically retries the job.

🔐 Webhook Signature Verification

Incoming webhook requests are authenticated using HMAC-SHA256.

The following headers are required:

X-Webhook-Timestamp: <unix_timestamp>
X-Webhook-Signature: sha256=<signature>

The server creates a signed payload using:

timestamp.raw_request_body

The expected signature is generated using:

HMAC-SHA256(
    WEBHOOK_SECRET,
    timestamp + "." + rawBody
)

The received signature is compared with the expected signature using a timing-safe comparison.

This protects the webhook endpoint against:

Unauthorized webhook requests
Payload tampering
Invalid signatures
🛡️ Replay Attack Protection

Every webhook request contains a timestamp.

The server compares the webhook timestamp with the current server timestamp.

The default tolerance is:

WEBHOOK_TOLERANCE_SECONDS=300

This provides a 5-minute acceptance window.

Requests outside the allowed window are rejected.

Current Time
     │
     ▼
Webhook Timestamp
     │
     ▼
Difference <= 300 seconds
     │
   ┌─┴─┐
   │   │
  YES  NO
   │   │
   ▼   ▼
 Accept Reject
♻️ Idempotency

Webhook providers may send the same event multiple times.

To prevent duplicate processing, the system uses the webhook's unique event_id.

Database insertion uses:

ON CONFLICT (event_id) DO NOTHING

If the event already exists, the API returns:

{
  "success": true,
  "duplicate": true,
  "message": "Webhook already received",
  "eventid": "evt-production-test-005"
}

This prevents duplicate webhook events from being queued multiple times.

🗄️ PostgreSQL

PostgreSQL is used as the persistent storage layer for webhook events.

Each webhook event maintains a processing status.

Possible statuses include:

received
processing
processed
failed

Example:

SELECT id, event_id, status
FROM webhook_events
ORDER BY id DESC;

Example successful event:

 id |        event_id         |   status
----+-------------------------+-----------
  6 | evt-production-test-005 | processed
⚡ Redis & BullMQ

Redis is used as the backend for BullMQ.

Queue name:

webhook-queue

BullMQ provides:

Background job processing
Automatic retries
Failed job tracking
Completed job tracking
Queue management

Example job:

{
  "webhookEventId": 6,
  "eventId": "evt-production-test-005",
  "payload": {
    "id": "evt-production-test-005",
    "type": "resource.created"
  }
}
👷 Webhook Worker

The worker is responsible for asynchronous webhook processing.

Worker file:

src/workers/webhookWorker.js

The worker performs:

1. Receive BullMQ job
2. Update event status → processing
3. Process webhook
4. Send automatic email notification
5. Update event status → processed

If processing fails:

1. Update event status → failed
2. Throw error
3. BullMQ retries the job
4. After maximum attempts → DLQ
🔁 Retry Mechanism

Webhook processing jobs are configured with:

Attempts: 3
Backoff: Fixed
Delay: 5000 ms

If a worker fails while processing a job, BullMQ automatically retries it.

Attempt 1
   │
   ▼
Failure
   │
   ▼
Wait 5 seconds
   │
   ▼
Attempt 2
   │
   ▼
Failure
   │
   ▼
Wait 5 seconds
   │
   ▼
Attempt 3
   │
   ▼
Failure
   │
   ▼
Dead Letter Queue
💀 Dead Letter Queue (DLQ)

Jobs that fail after all retry attempts are moved to a Dead Letter Queue.

The DLQ stores information such as:

Webhook Event ID
Event ID
Payload
Original Job ID
Error message
Failure timestamp

Failed jobs can be inspected and retried through the available API.

📊 Bull Board

Bull Board provides a web-based dashboard for monitoring BullMQ.

Production:

https://webhook-ingestion-system.onrender.com/admin/queues

The dashboard allows monitoring of:

Waiting jobs
Active jobs
Completed jobs
Failed jobs
Queue activity
Retry state
📚 Swagger / OpenAPI

Interactive API documentation is available through Swagger UI.

Production
https://webhook-ingestion-system.onrender.com/docs
Local
http://localhost:5000/docs

Swagger provides:

API endpoint documentation
Request schemas
Response schemas
Authentication information
Interactive API testing
Example requests and responses
📖 API Endpoints
Authentication
Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Authenticate user
GET	/auth/profile	Get authenticated user profile
GET	/auth/admin	Admin-only route
Webhook
Method	Endpoint	Description
POST	/webhook	Receive and queue webhook
GET	/webhook/failed	Retrieve failed/DLQ jobs
POST	/webhook/retry/:jobId	Retry a failed job
Health
Method	Endpoint	Description
GET	/health	Application health check
📥 Webhook Request
Endpoint
POST /webhook

Production:

https://webhook-ingestion-system.onrender.com/webhook
Headers
Content-Type: application/json
X-Webhook-Timestamp: <unix_timestamp>
X-Webhook-Signature: sha256=<signature>
Example Payload
{
  "id": "evt-production-test-005",
  "type": "resource.created",
  "timestamp": 1788091063,
  "data": {
    "resourceId": "res-production-001"
  }
}
📤 Successful Response
{
  "success": true,
  "duplicate": false,
  "message": "Webhook received and queued successfully",
  "eventId": "evt-production-test-005",
  "webhookEventId": 6,
  "jobId": "5"
}

The jobId represents the BullMQ job created for asynchronous processing.

🧪 Testing

A production webhook test script is included in the project.

Run:

node test-production-webhook.js

The script:

Generates a current Unix timestamp
Creates the webhook payload
Generates the HMAC-SHA256 signature
Sends the webhook request
Prints the API response

Example:

Sending webhook...

Timestamp: 1788091063

Signature: sha256=...

STATUS: 200

RESPONSE:
{
  "success": true,
  "duplicate": false,
  "message": "Webhook received and queued successfully",
  "eventId": "evt-production-test-005",
  "webhookEventId": 6,
  "jobId": "5"
}
🧪 Production Verification

A successful production webhook can be verified at multiple levels.

1. API Response
STATUS: 200

Example:

{
  "success": true,
  "duplicate": false
}
2. Worker Logs
Processing webhook event evt-production-test-005

RESEND DATA: { id: "..." }
RESEND ERROR: null

Notification email sent for webhook evt-production-test-005

Webhook event 6 processed successfully
3. PostgreSQL

Run:

SELECT id, event_id, status
FROM webhook_events
WHERE event_id = 'evt-production-test-005';

Expected:

 id |        event_id         |   status
----+-------------------------+-----------
  6 | evt-production-test-005 | processed

This confirms the complete pipeline:

Webhook
   ↓
API
   ↓
PostgreSQL
   ↓
BullMQ
   ↓
Worker
   ↓
Resend
   ↓
Email Notification
   ↓
PostgreSQL = processed
🩺 Health Check
Production
https://webhook-ingestion-system.onrender.com/health
Local
http://localhost:5000/health

Using curl:

curl http://localhost:5000/health
🐳 Docker

The project supports Docker and Docker Compose.

Build and Start
docker compose up -d --build
View Running Containers
docker ps
Stop Containers
docker compose down
View Application Logs
docker logs -f webhook-app
View Worker Logs
docker logs -f webhook-worker
View PostgreSQL Logs
docker logs -f postgres-db
View Redis Logs
docker logs -f redis-server
🗃️ Database Migrations

Database migrations are managed using node-pg-migrate.

Run migrations:

npm run migrate
⚙️ Local Development
1. Clone Repository
git clone https://github.com/Abhinav27srivastava/webhook-ingestion-system.git
2. Enter Project Directory
cd webhook-ingestion-system
3. Install Dependencies
npm install
4. Configure Environment Variables

Create a .env file in the project root.

PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=webhook_db
DB_USER=postgres
DB_PASSWORD=your_database_password

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h

WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_TOLERANCE_SECONDS=300

FRONTEND_URL=http://localhost:3000

RESEND_API_KEY=your_resend_api_key
NOTIFICATION_EMAIL=your_email@example.com

Never commit .env, passwords, API keys, JWT secrets, database credentials, or webhook secrets to GitHub.

5. Run Database Migrations
npm run migrate
6. Start API
npm start
7. Start Worker
npm run worker
🛠️ Tech Stack
Technology	Purpose
Node.js	JavaScript Runtime
Express.js	REST API Framework
PostgreSQL	Persistent Event Storage
Redis	Queue Backend
BullMQ	Background Job Processing
Bull Board	Queue Monitoring
Docker	Containerization
Docker Compose	Local Container Orchestration
JWT	Authentication
bcrypt	Password Hashing
Zod	Request Validation
Resend	Automatic Email Notifications
Swagger	API Documentation
Helmet	HTTP Security
CORS	Cross-Origin Request Control
express-rate-limit	API Rate Limiting
Pino	Structured Logging
node-pg-migrate	Database Migrations
📂 Project Structure
webhook-ingestion-system/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   │
│   ├── controllers/
│   │
│   ├── docs/
│   │   ├── swagger.js
│   │   └── bullboard.js
│   │
│   ├── logger/
│   │   └── logger.js
│   │
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── ratelimiter.js
│   │   ├── webhookSignature.js
│   │   └── bullboardAuth.js
│   │
│   ├── queue/
│   │   ├── webhookQueue.js
│   │   └── deadletterqueue.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── webhook.js
│   │   ├── health.js
│   │   └── dlq.js
│   │
│   ├── services/
│   │   └── notificationService.js
│   │
│   ├── validation/
│   │   └── webhookSchema.js
│   │
│   ├── workers/
│   │   └── webhookWorker.js
│   │
│   ├── app.js
│   └── server.js
│
├── migrations/
│
├── tests/
│
├── Dockerfile
├── docker-compose.yml
├── migrate.js
├── package.json
├── package-lock.json
├── test-production-webhook.js
└── README.md
🔄 End-to-End Webhook Flow
                    Incoming Webhook
                           │
                           ▼
                 ┌───────────────────┐
                 │ Express Middleware │
                 └─────────┬─────────┘
                           │
                           ▼
                 Signature Verification
                           │
                           ▼
                  Replay Protection
                           │
                           ▼
                    Zod Validation
                           │
                           ▼
                   Event ID Check
                           │
                    ┌──────┴──────┐
                    │             │
                 Duplicate      New Event
                    │             │
                    ▼             ▼
                Return 200    PostgreSQL
                                  │
                                  ▼
                             BullMQ Queue
                                  │
                                  ▼
                             Worker
                                  │
                         ┌────────┴────────┐
                         │                 │
                      Success           Failure
                         │                 │
                         ▼                 ▼
                  Send Email           Retry
                         │                 │
                         ▼                 ▼
                  status=processed       3 Attempts
                                           │
                                           ▼
                                          DLQ
🔒 Security Architecture

The application uses multiple layers of protection:

Incoming Request
       │
       ▼
CORS
       │
       ▼
Helmet
       │
       ▼
Rate Limiting
       │
       ▼
HMAC Signature Verification
       │
       ▼
Timestamp Validation
       │
       ▼
Zod Payload Validation
       │
       ▼
Application Logic

Authentication-protected endpoints additionally use:

JWT Authentication
       │
       ▼
Role-Based Access Control
📈 Reliability

The system is designed to reduce the risk of losing webhook events during processing failures.

Reliability is achieved through:

PostgreSQL persistence
Redis-backed queue
Asynchronous processing
Automatic job retries
Dead Letter Queue
Idempotent event handling
Explicit processing states
Structured logging
Automatic email notification processing
☁️ Production Deployment

The application is deployed on Render.

Production architecture:

                    Render
                      │
              ┌───────┴────────┐
              │                │
              ▼                ▼
         Web Service       Worker
              │                │
              └───────┬────────┘
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
        PostgreSQL           Redis
                               │
                               ▼
                             BullMQ
                               │
                               ▼
                             Resend

Production API:

https://webhook-ingestion-system.onrender.com
🚀 Future Improvements

Potential future enhancements include:

Prometheus metrics
Grafana dashboards
Advanced queue metrics
Kubernetes deployment
CI/CD pipeline
Horizontal worker scaling
Webhook provider-specific adapters
Distributed tracing
Automated alerting
Advanced observability
👨‍💻 Author
Abhinav Srivastava

B.Tech – Information Technology

GitHub:

https://github.com/Abhinav27srivastava

Repository:

https://github.com/Abhinav27srivastava/webhook-ingestion-system
⭐ Support

If you found this project useful, consider giving the repository a ⭐ on GitHub.

📄 License

This project is developed for educational and project demonstration purposes.

