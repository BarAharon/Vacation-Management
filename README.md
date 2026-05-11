# Vacation Management

A full-stack web application for managing employee vacation requests. Employees can submit requests, and managers can review, approve, or reject them.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Technical Decisions](#technical-decisions)
- [Testing](#testing)
- [Known Limitations](#known-limitations)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Vue Router, Axios, Bootstrap 5 |
| Backend | Node.js, Express |
| ORM | TypeORM |
| Database | PostgreSQL |

---

## Project Structure

```
Vacation-Management/
├── server/                  # Node.js + Express backend
│   └── src/
│       ├── config/          # Database connection (TypeORM DataSource)
│       ├── entities/        # TypeORM EntitySchema definitions
│       ├── models/          # Repository layer (data access)
│       ├── services/        # Business logic
│       ├── controllers/     # HTTP request/response handling
│       ├── routes/          # Express routers
│       ├── middleware/      # Global error handler
│       ├── seed.js          # Database seeder
│       └── index.js         # App entry point
│
└── client/                  # Vue 3 frontend
    └── src/
        ├── api/             # Axios API calls
        ├── store/           # Reactive session store
        ├── router/          # Vue Router with route guards
        ├── views/           # HomeView, RequesterView, ValidatorView
        └── components/      # StatusBadge, RejectModal
```

---

## Installation & Setup

### Prerequisites

- Node.js v18+
- PostgreSQL v14+

### 1. Clone the repository

```bash
git clone <repository-url>
cd Vacation-Management
```

### 2. Install PostgreSQL (macOS)

```bash
brew install postgresql@14
brew services start postgresql@14
echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Create the database

```bash
psql postgres -c "CREATE DATABASE vacation_management;"
```

### 4. Configure environment variables

Edit `server/.env` with your PostgreSQL credentials:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=vacation_management
DB_USER=your_system_username
DB_PASSWORD=
```

> On a default macOS PostgreSQL install the username is your system username and the password is empty.

### 5. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

---

## Running the Application

### Seed the database (first time only)

```bash
cd server
npm run seed
```

This creates 5 sample users:

| Name | Role |
|------|------|
| Alice Johnson | Requester |
| Bob Smith | Requester |
| Carol White | Requester |
| David Manager | Validator |
| Eve Supervisor | Validator |

### Start the backend

```bash
cd server
npm run dev        # development (nodemon auto-reload)
# or
npm start          # production
```

Server runs at `http://localhost:3000`

### Start the frontend

```bash
cd client
npm run dev
```

Frontend runs at `http://localhost:5173`

Open `http://localhost:5173` in your browser and select a user to log in.

---

## API Reference

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get a single user |

### Vacation Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/requests` | Submit a new vacation request |
| GET | `/api/requests` | Get all requests (validator view) |
| GET | `/api/requests?status=Pending` | Filter by status |
| GET | `/api/requests/user/:userId` | Get requests by user |
| PATCH | `/api/requests/:id/approve` | Approve a request |
| PATCH | `/api/requests/:id/reject` | Reject a request (requires `comments` in body) |

#### Example — Submit a request

```json
POST /api/requests
{
  "userId": 1,
  "start_date": "2025-07-01",
  "end_date": "2025-07-10",
  "reason": "Summer vacation"
}
```

#### Example — Reject a request

```json
PATCH /api/requests/3/reject
{
  "comments": "Too many team members already on leave during this period."
}
```

---

## Technical Decisions

### MVC-style layered architecture (server)

The backend is split into four layers — routes, controllers, services, and models — to separate concerns clearly. Routes handle URL mapping, controllers handle HTTP input/output, services contain all business logic, and models wrap TypeORM repositories for data access.

### EntitySchema instead of decorators (TypeORM + plain JavaScript)

TypeORM's decorator syntax (`@Entity`, `@Column`) requires TypeScript or a Babel decorator plugin. Since the project uses plain ES6+ JavaScript, `EntitySchema` was used instead — it is the officially supported TypeORM approach for plain JS and provides the same functionality without a build step.

### `synchronize: true` for schema management

TypeORM's `synchronize` option automatically creates and updates database tables based on the entity definitions when the server starts. This is suitable for development and avoids the need to write and run migrations manually.

### Reactive store with `localStorage` (client)

Rather than adding Pinia or Vuex, a lightweight reactive object (`Vue.reactive`) is used as the session store. The selected user is persisted in `localStorage` so the session survives page refreshes. This keeps the client simple given there is no real authentication.

### Bootstrap 5 + Bootstrap Icons for UI

Chosen to quickly achieve a professional admin panel look (inspired by Inspinia) without writing a large amount of custom CSS. The sidebar layout, stat cards, tables, and modal are all built on Bootstrap utilities with minimal custom overrides.

---

## Testing

Tests are written with **Vitest** and cover the service layer — the layer that contains all business logic and validation rules. The model layer is mocked so tests run without a database.

### Test files

```
server/tests/
└── services/
    ├── userService.test.js              # 2 test suites, 3 tests
    └── vacationRequestService.test.js   # 4 test suites, 16 tests
```

### What is tested

| Service | Scenario |
|---------|----------|
| `userService.getAllUsers` | Returns all users from the model |
| `userService.getUserById` | Returns user when found; throws 404 when not found |
| `vacationRequestService.submitRequest` | Happy path; user not found (404); user is a Validator (403); end_date before start_date (400); reason defaults to null |
| `vacationRequestService.getAllRequests` | No filter; valid status filter; invalid status throws 400 |
| `vacationRequestService.approveRequest` | Happy path; request not found (404); already approved (400) |
| `vacationRequestService.rejectRequest` | Happy path; missing comment (400); whitespace-only comment (400); not found (404); already rejected (400) |

### Running the tests

```bash
cd server

npm test            # run all tests once
npm run test:watch  # watch mode (re-runs on file changes)
```

Expected output:

```
 Test Files  2 passed (2)
      Tests  19 passed (19)
```

---

## Known Limitations

- **No authentication.** Users are identified by selecting their name from a dropdown. There is no login, password, or session token system. In a production application this would need a proper auth layer (e.g. JWT).

- **No role enforcement on the API.** The backend trusts the `userId` sent in request bodies. Any client could submit a request on behalf of any user. API-level authorization middleware was not implemented.

- **`synchronize: true` is not safe for production.** Auto-synchronizing the schema can cause data loss if entity definitions change (e.g. a column rename drops and recreates the column). In production, TypeORM migrations should be used instead.

- **No pagination.** The validator dashboard fetches all requests in a single query. For large datasets this would need server-side pagination.

- **Single environment.** There is only one `.env` file and no distinction between development, staging, and production configurations.

- **Tests cover the service layer only.** Controller and model layers are not tested. Integration tests against a real database were not included.
