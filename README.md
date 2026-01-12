# GovTech Assessment API (TypeScript)

A TypeScript-based REST API for a school administrative system, allowing teachers to register students, check common students, suspend students, and retrieve notification recipients.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (recommended)
- MySQL 8.0 (if running locally without Docker)

### Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/namdh58/GovTech-Assessment-API-Namdh58.git
cd GovTech-Assessment-API-Namdh58

# Start the application
docker-compose up --build
```

The API will be available at `http://localhost:3000`

### Run Locally (Without Docker)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=govtech_db
   SERVER_PORT=3000
   ```

3. **Setup Database**:
   - Ensure MySQL is running
   - Create database: `CREATE DATABASE govtech_db;`

4. **Run Migrations**:
   ```bash
   npm run migration:run
   ```

5. **Start the Server**:
   ```bash
   npm run dev    
   npm start      
   ```

## 📚 Step-by-Step Tutorial

This tutorial will guide you through setting up and running the application from scratch.

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/namdh58/GovTech-Assessment-API-Namdh58.git
cd GovTech-Assessment-API-Namdh58

# Install dependencies
npm install
```

### Step 2: Setup Database

#### Option A: Using Docker (Recommended)

```bash
# Start MySQL and the application
docker-compose up --build

# The database, migrations, and seeding will be handled automatically
```

#### Option B: Local MySQL

1. **Start MySQL** (ensure MySQL 8.0+ is installed and running)

2. **Create `.env` file** in the project root:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=govtech_db
   SERVER_PORT=3000
   ```

3. **Create the database**:
   ```sql
   CREATE DATABASE govtech_db;
   ```

### Step 3: Run Migrations

Migrations create the database schema (tables, relationships, indexes).

```bash
# Run all pending migrations
npm run migration:run
```

**What this does:**
- Creates `teachers` table
- Creates `students` table
- Creates `teacher_students` junction table for many-to-many relationships
- Adds indexes for performance

### Step 4: Seed Initial Data

The seed script populates the database with mock data for testing.

```bash
# Run the seed script
npm run seed
```

**What gets created:**

**Teachers:**
- teacherken@gmail.com
- teacherjoe@gmail.com

**Students:**
- studentjon@gmail.com
- studenthon@gmail.com
- commonstudent1@gmail.com
- commonstudent2@gmail.com
- studentmary@gmail.com

**Relationships:**
- TeacherKen → studentjon, studenthon, commonstudent1, commonstudent2
- TeacherJoe → commonstudent1, commonstudent2

**Note:** The seed script is idempotent - safe to run multiple times. It will skip existing records.

### Step 5: Start the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at: **http://localhost:3000**

### Step 6: Test the API

#### Using cURL

**1. Register Students to a Teacher:**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "teacher": "teacherken@gmail.com",
    "students": ["studentjon@gmail.com", "studenthon@gmail.com"]
  }'
```

**Expected Response:** `204 No Content`

---

**2. Get Common Students:**
```bash
curl -X GET "http://localhost:3000/api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com"
```

**Expected Response:**
```json
{
  "students": ["commonstudent1@gmail.com", "commonstudent2@gmail.com"]
}
```

---

**3. Suspend a Student:**
```bash
curl -X POST http://localhost:3000/api/suspend \
  -H "Content-Type: application/json" \
  -d '{
    "student": "studentmary@gmail.com"
  }'
```

**Expected Response:** `204 No Content`

---

**4. Retrieve Notification Recipients:**
```bash
curl -X POST http://localhost:3000/api/retrievefornotifications \
  -H "Content-Type: application/json" \
  -d '{
    "teacher": "teacherken@gmail.com",
    "notification": "Hello students! @studentagnes@gmail.com"
  }'
```

**Expected Response:**
```json
{
  "recipients": [
    "studentjon@gmail.com",
    "studenthon@gmail.com",
    "commonstudent1@gmail.com",
    "commonstudent2@gmail.com",
    "studentagnes@gmail.com"
  ]
}
```

#### Using Postman

1. **Import Collection:**
   - Open Postman
   - Click **Import**
   - Select `documents/GovTech Assessment.postman_collection.json`

2. **Set Base URL:**
   - Click on the collection
   - Go to **Variables** tab
   - Set `baseUrl` to `http://localhost:3000`

3. **Run Requests:**
   - Navigate through folders: Register, Common Students, Suspend, Notifications
   - Each folder contains example requests with pre-filled data

### Step 7: Verify Database Changes

Connect to your MySQL database and verify the data:

```sql
-- View all teachers
SELECT * FROM teachers;

-- View all students
SELECT * FROM students;

-- View teacher-student relationships
SELECT 
    t.email AS teacher,
    s.email AS student
FROM teachers t
JOIN teacher_students ts ON t.id = ts.teacherId
JOIN students s ON s.id = ts.studentId
ORDER BY t.email, s.email;

-- Check suspended students
SELECT email, is_suspended FROM students WHERE is_suspended = 1;
```

### Step 8: Run Tests

Verify everything works correctly by running the test suite:

```bash
npm test
```

**Expected Output:**
```
✓ 15 passing tests
✓ Service layer tests
✓ Controller layer tests
```

### Troubleshooting

#### Database Connection Issues

**Problem:** `ER_ACCESS_DENIED_ERROR`
- **Solution:** Check your `.env` credentials match your MySQL user

**Problem:** `ER_BAD_DB_ERROR`
- **Solution:** Database doesn't exist. Run `CREATE DATABASE govtech_db;`

#### Migration Issues

**Problem:** Migration already executed
- **Solution:** This is normal if migrations were already run. Skip or use `npm run migration:revert` to rollback

#### Seed Script Issues

**Problem:** Duplicate entry errors
- **Solution:** The seed script is idempotent. Duplicate warnings are normal and safe to ignore


### Next Steps

- 📖 Read the [API Documentation](#-api-endpoints) for detailed endpoint specifications
- 🧪 Explore the test suite in `tests/` directory
- 🏗️ Review the [Project Structure](#-project-structure) to understand the codebase
- 🚀 Try [deploying to Google Cloud Run](#-deployment-to-google-cloud-run)

## 🧪 Testing

Run the comprehensive unit test suite:

```bash
npm test
```

**Test Coverage:**
- ✅ 15 passing tests
- ✅ Service layer tests (SchoolService)
- ✅ Controller layer tests (SchoolController)
- ✅ Pre-commit hooks with Husky (tests run automatically before commit)

## 📦 Postman Collection

Import the collection to test all API endpoints:

**Location**: `documents/GovTech Assessment.postman_collection.json`

1. Open Postman
2. Click **Import**
3. Drag and drop the JSON file
4. Update `baseUrl` variable if needed (default: `http://localhost:3000`)

## 🏗️ Project Structure

```
src/
├── config/           # Database configuration (TypeORM DataSource)
├── controllers/      # Request handlers
├── dtos/            # Request validation schemas (Joi)
├── entities/        # TypeORM entities (Teacher, Student)
├── middlewares/     # Validation, error handling, rate limiting
├── migrations/      # Database migrations
├── repositories/    # Custom repository methods
├── routes/          # API route definitions
├── scripts/         # Database seeding and utility
├── services/        # Business logic layer
├── utils/           # Helpers, constants, exceptions
├── app.ts           # Express app setup
└── server.ts        # Entry point

tests/
├── controllers/     # Controller unit tests
└── services/        # Service unit tests
```

### Folder Descriptions

*   **`src/config`**: Database configuration using TypeORM DataSource. Handles connection settings, entity registration, and migration paths.
*   **`src/controllers`**: Request handlers that process incoming HTTP requests. Controllers parse the request, call the appropriate service methods, and format the HTTP response. Keeping controllers thin ensures clean separation of concerns.
*   **`src/services`**: Core business logic layer. This layer interacts with repositories to fetch/save data and implements the application rules (e.g., checking if a student is suspended, validating teacher existence).
*   **`src/repositories`**: Data access layer abstracting database interactions. Complex queries (like finding common students or filtering notification recipients) are encapsulated here, keeping the Service layer focused on business rules.
*   **`src/entities`**: TypeORM entity definitions representing database tables. Each file defines the schema, relationships, and constraints for a table.
*   **`src/middlewares`**: Express middleware functions for cross-cutting concerns:
    - **Validation**: Input validation using Joi schemas
    - **Error Handling**: Centralized error response formatting
    - **Rate Limiting**: Request throttling to prevent abuse
*   **`src/routes`**: API endpoint definitions mapping HTTP methods and paths to their respective controllers and middlewares.
*   **`src/dtos`**: Data Transfer Objects defining request validation schemas using Joi.
*   **`src/scripts`**: Standalone scripts for database seeding and other utility tasks. These scripts can be run independently via npm commands.
*   **`src/utils`**: Utility functions, constants, custom exceptions, and helper methods.
*   **`src/migrations`**: TypeORM migration files for database schema versioning.

## 🔄 Request Flow

Detailed flow of how a request is processed from entry to response:

1.  **Request Entry**: The HTTP request hits `server.ts` and is passed to the Express application instance.

2.  **Global Middlewares** (Applied to all requests):
    *   **Helmet**: Adds security headers (XSS protection, content security policy, etc.)
    *   **CORS**: Handles Cross-Origin Resource Sharing
    *   **JSON Parser**: Parses incoming JSON request bodies
    *   **Rate Limiter**: Enforces rate limits (100 requests per 15 minutes per IP)
    *   **Morgan Logger**: Logs HTTP request details for monitoring

3.  **Routing** (`src/routes/api.routes.ts`): The request is matched to a defined route based on HTTP method and path (e.g., `POST /api/register`).

4.  **Route-Specific Middlewares**:
    *   **Validation Middleware**: Validates the request body/query against the DTO schema using Joi. If validation fails, a `400 Bad Request` error is thrown immediately.

5.  **Controller** (`src/controllers`): 
    *   Receives the validated request
    *   Extracts necessary data (body, query params, path params)
    *   Calls the appropriate Service method
    *   Wraps the call in `asyncHandler` for automatic error handling

6.  **Service** (`src/services`): 
    *   Executes business logic
    *   Calls **Repositories** to interact with the database
    *   Performs business rule checks (e.g., "Is the student already suspended?", "Does the teacher exist?")
    *   Throws specific Exceptions (`NotFoundError`, `BadRequestError`) if rules are violated
    *   Returns processed data to the Controller

7.  **Repository** (`src/repositories`): 
    *   Executes database queries using TypeORM
    *   Uses QueryBuilder for complex queries
    *   Returns Entity objects or raw data to the Service

8.  **Response Formation**: 
    *   Service returns result to Controller
    *   Controller formats the response (status code + data)
    *   `asyncHandler` sends the HTTP response

9.  **Error Handling**: 
    *   If any step throws an error, the **Global Error Handler** (`src/middlewares/response.middleware.ts`) catches it
    *   Formats the error into a standardized JSON response
    *   Sets appropriate HTTP status code
    *   Sends error response to client

## 🌐 Deployment to Google Cloud Run

### Prerequisites
1. Google Cloud Project with billing enabled
2. Enable APIs:
   - Cloud Run API
   - Artifact Registry API
   - Cloud SQL Admin API
3. Create a Cloud SQL MySQL instance
4. Create an Artifact Registry repository

### GitHub Secrets Required

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
GCP_PROJECT_ID          # Your GCP project ID
GCP_REGION              # e.g., asia-southeast1
GCP_SA_KEY              # Service account JSON key (with Cloud Run, Artifact Registry permissions)
AR_REPO                 # Artifact Registry repository name
CLOUD_RUN_SERVICE       # Cloud Run service name (e.g., govtech-api)
GCP_CLOUDSQL_INSTANCE_NAME  # Format: project:region:instance
DB_USER                 # Cloud SQL database user
DB_PASSWORD             # Cloud SQL database password
DB_NAME                 # Database name
```

### Deployment Steps

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:
- Build the Docker image
- Push to Artifact Registry
- Deploy to Cloud Run
- Connect to Cloud SQL via Unix socket

## 📝 API Endpoints

### 1. Register Students
**POST** `/api/register`

```json
{
  "teacher": "teacherken@gmail.com",
  "students": ["studentjon@gmail.com", "studenthon@gmail.com"]
}
```

**Response**: `204 No Content`

**Exceptions**:
- `400`: Invalid email format, missing fields
- `404`: Teacher not found

---

### 2. Get Common Students
**GET** `/api/commonstudents?teacher=teacherken@gmail.com&teacher=teacherjoe@gmail.com`

**Response**:
```json
{
  "students": ["commonstudent1@gmail.com", "commonstudent2@gmail.com"]
}
```

**Exceptions**:
- `400`: Missing teacher parameter
- `404`: Teacher(s) not found

---

### 3. Suspend Student
**POST** `/api/suspend`

```json
{
  "student": "studentmary@gmail.com"
}
```

**Response**: `204 No Content`

**Exceptions**:
- `400`: Invalid email, missing field, student already suspended
- `404`: Student not found

---

### 4. Retrieve for Notifications
**POST** `/api/retrievefornotifications`

```json
{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
}
```

**Response**:
```json
{
  "recipients": ["studentbob@gmail.com", "studentagnes@gmail.com", "studentmiche@gmail.com"]
}
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev              # Start development server with nodemon
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production server
npm test                 # Run Jest tests
npm run lint             # Run ESLint
npm run seed             # Seed database with initial mock data
npm run migration:generate  # Generate new migration (on commit remember CREATE IF NOT EXISTS)
npm run migration:run    # Run pending migrations
npm run migration:revert # Revert last migration
```

### Database Migrations

Migrations are automatically run on application startup (`migrationsRun: true` in data-source.ts).

To manually run migrations:
```bash
npm run migration:run
```

## 🔒 Security Features

- ✅ CORS enabled
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Input validation with Joi
- ✅ SQL injection protection (TypeORM parameterized queries)
