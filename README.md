# GovTech Assessment API

This project is a NodeJS-based API for a school administrative system, allowing teachers to register students, check common students, suspend students, and retrieve notification recipients.

## How to Run

### Prerequisities
*   Node.js (v18+)
*   MySQL

### Local Setup
1.  **Clone the repository**
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    *   Copy `.env.example` to `.env` (or create one based on the example below).
    *   Ensure MySQL is running and credentials match.
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=school_admin
    DB_AUTO_SYNCHRONIZE=true
    ```
4.  **Initialize Database**:
    Run the initialization script to seed the database with necessary tables and default data.
    ```bash
    node src/scripts/init-data.js
    ```
5.  **Start the Server**:
    ```bash
    npm start
    # OR for development
    npm run dev
    ```

### Docker Setup (Recommended)
You can spin up the entire stack (App, MySQL) using Docker Compose.

1.  **Build and Run**:
    ```bash
    docker-compose up --build
    ```
2.  **Initialize Data** (Once containers are up):
    Run the script inside the container:
    ```bash
    docker-compose exec app node src/scripts/init-data.js
    ```

## Postman Collection

A comprehensive Postman Collection is included to facilitate testing of the API endpoints.

**Location**: `documents/GovTech Assessment.postman_collection.json`

### How to Use

1.  **Import**:
    *   Open Postman.
    *   Click **Import** (top left).
    *   Drag and drop the `GovTech Assessment.postman_collection.json` file into the modal.

2.  **Environment Variables**:
    *   The collection comes with a pre-configured `baseUrl` variable set to `http://localhost:3000`. If your server is running on a different port, update this variable in the Collection Settings (Programs -> Edit -> Variables).

## Project Structure

The project is organized into a modular structure to ensure separation of concerns and maintainability.

```
src/
├── config/         # Configuration files (Database, Environment variables)
├── controllers/    # Request handlers, processing input and creating responses
├── dtos/           # Data Transfer Objects, defining schemas for request validation
├── entities/       # Database entities (TypeORM definitions)
├── middlewares/    # Express middlewares (Validation, Error Handling)
├── repositories/   # Data access layer, abstracting database queries
│   ├── index.js             # Export point for repositories
│   ├── StudentRepository.js # Custom repository for Student-related queries
│   └── TeacherRepository.js # Custom repository for Teacher-related queries
├── routes/         # API route definitions
├── services/       # Business logic layer
├── utils/          # Utility functions and constants
├── app.js          # Express application setup
└── server.js       # Server entry point
```

### Folder Descriptions

*   **`src/controllers`**: Contains the logic for handling incoming HTTP requests. Controllers parse the request, call the appropriate service methods, and format the HTTP response. usage separate controllers keeps the routing logic clean.
*   **`src/services`**: Contains the core business logic. This layer interacts with repositories to fetch/save data and implements the rules of the application (e.g., checking if a student is suspended).
*   **`src/repositories`**: Abstraction layer for database interactions. Moving complex queries (like finding common students or filtering notification recipients) here keeps the Service layer focused on business rules rather than SQL/QueryBuilders.
*   **`src/entities`**: Defines the database schema using TypeORM. Each file represents a table in the database.
*   **`src/middlewares`**: Contains interceptors for requests, handling tasks like Input Validation (JOI), and centralized Error Handling.
*   **`src/routes`**: Defines the API endpoints and maps them to their respective controllers and middlewares.

## Request Flow

How the server processes a request from start to end:

1.  **Request Entry**: The request hits `server.js` and is passed to the Express `app`.
2.  **Global Middlewares**:
    *   **Helmet/Cors**: Security headers and CORS handling.
    *   **JSON Parser**: Parses the request body.
    *   **Rate Limiter**: Limits the number of requests to prevent abuse.
    *   **Logger (Morgan)**: Logs the request details.
3.  **Routing (`src/routes/api.routes.js`)**: The request is matched to a defined route (e.g., `POST /api/register`).
4.  **Route Middlewares**:
    *   **Validation**: Validates the request body against the DTO schema using `validate(dto)`. If invalid, a `400 Bad Request` is thrown immediately.
5.  **Controller (`src/controllers`)**: The controller receives the validated request. It extracts necessary data (body, query params) and calls the Service.
6.  **Service (`src/services`)**: The service executes business logic.
    *   It may call **Repositories** (`src/repositories`) to interact with the database.
    *   It performs checks (e.g., "Is the student already suspended?").
    *   If a rule is violated, it throws a specific Exception (e.g., `NotFoundError`).
7.  **Repository (`src/repositories`)**: Executes the actual database queries (TypeORM) and returns Entities/Data to the Service.
8.  **Response**: The Service returns the result to the Controller, which creates a standardized response object.
9.  **Error Handling**: If any step throws an error, the **Global Error Handler** (`src/middlewares/response.middleware.js`) catches it, formats it into a standard JSON error response (e.g., `{ "message": "..." }`), and sends it to the client.

## API Exceptions

Here are the exceptions handled for each API endpoint:

### 1. Register Students (`POST /api/register`)
*   **Validation Errors (400)**:
    *   Invalid email format.
    *   Missing required fields (`teacher`, `students`).

### 2. Get Common Students (`GET /api/commonstudents`)
*   **Validation Errors (400)**:
    *   `teacher` query parameter missing.
*   **Business Logic Errors**:
    *   **`NotFoundError` (404)**: Thrown if one or more of the provided teacher emails do not exist in the database (`Teachers not found: [emails]`).

### 3. Suspend Student (`POST /api/suspend`)
*   **Validation Errors (400)**:
    *   Invalid email format.
    *   Missing `student` field.
*   **Business Logic Errors**:
    *   **`NotFoundError` (404)**: Thrown if the student email does not exist (`Student Not Found`).
    *   **`BadRequestError` (400)**: Thrown if the student is already suspended (`Student is already suspended`).

### 4. Retrieve for Notifications (`POST /api/retrievefornotifications`)
*   **Validation Errors (400)**:
    *   Missing `teacher` or `notification` fields.
*   **Business Logic Errors**:
    *   No specific business logic exceptions are thrown; returns an empty list or partial list if entities aren't found, but ensures strict filtering based on suspension status and relationships.

