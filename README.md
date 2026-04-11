# TransitEquity - Transportation Service Gap Analyzer

TransitEquity is a full-stack MERN (MongoDB, Express, React, Node) application designed to identify and visualize gaps in public transportation services. It provides administrators with powerful tools for infrastructure management, community feedback monitoring, and automated gap analysis to improve transit equity in underserved areas.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Atlas account or local instance)
- **Google Maps API Key** (with Maps JavaScript API and Geocoding API enabled)

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` root:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` root:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   VITE_API_BASE_URL=http://localhost:5001
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoint Documentation

The RESTful API adheres strictly to **JSON** format for both request bodies and responses (`application/json`). All endpoints are robustly structured around standard HTTP methods (GET, POST, PUT, DELETE).

### 🔐 Authentication Details
TransitEquity secures its endpoints using **JSON Web Tokens (JWT)**.
- **Issuance**: Upon successful login or registration, the authentication server issues a signed JWT.
- **Transmission**: The client must include this token in the `Authorization` HTTP header for all protected routes, formatted strictly using the Bearer schema: `Authorization: Bearer <your_token_here>`.
- **Validation**: Protected endpoints utilize a middleware to intercept the request, cryptographically verify the token's validity, and extract the user's role and identification before processing the request.

### 👥 Role-Based Access Control (RBAC)
The system enforces strict access control through a layered hierarchy of four distinct capabilities:
- **Admin**: Full, unrestricted system access. Authorized to manage users, create infrastructure entities (areas/routes), and view comprehensive system data.
- **Planner**: Focused primarily on high-level gap analysis and strategic planning. Authorized to trigger analysis algorithms and view analytical models.
- **iOfficer (Infrastructure Officer)**: Geared towards maintaining infrastructure accuracy. Authorized to add, modify, or verify regional facilities.
- **User**: General public access tier. Authorized to view basic transit data, update personal profiles, and submit categorized community gap feedback.

### 📌 Core Endpoints & Payload Examples

#### 1. Authentication Endpoints
| Method | Endpoint | Description | Auth Required | Accessible By |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new user | No | Public |
| POST | `/api/auth/login` | Authenticate and obtain JWT | No | Public |
| GET  | `/api/auth/me` | Fetch detailed user profile | Yes | All Roles |
| POST | `/api/auth/logout` | Clear user session | Yes | All Roles |

**Example: User Login (`POST /api/auth/login`)**
*Request Body (JSON):*
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
*Success Response (200 OK):*
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": "60bcfe4f5311236168a109ca",
    "name": "Jane Doe",
    "role": "User"
  }
}
```
*Error Response (401 Unauthorized):*
```json
{
  "success": false,
  "error": "Invalid credentials provided."
}
```

#### 2. Infrastructure Management Endpoints
| Method | Endpoint | Description | Auth Required | Accessible By |
| :--- | :--- | :--- | :--- | :--- |
| GET    | `/api/facilities` | List local facilities (paginated) | Yes | All Roles |
| POST   | `/api/facilities` | Create new facility resource | Yes | Admin, iOfficer |
| GET    | `/api/areas` | List designated areas (paginated) | Yes | All Roles |
| POST   | `/api/areas` | Designate a new administrative area | Yes | Admin |
| GET    | `/api/transports` | List registered transit routes | Yes | All Roles |
| POST   | `/api/transports` | Implement new transit route | Yes | Admin |

**Example: Create Facility (`POST /api/facilities`)**
*Request Body (JSON):*
```json
{
  "name": "Central Bus Terminus",
  "type": "Bus Station",
  "location": {
    "lat": 6.9271,
    "lng": 79.8612
  },
  "capacity": 500,
  "accessibilityFeatures": ["Wheelchair Ramp", "Elevator"]
}
```
*Success Response (201 Created):*
```json
{
  "success": true,
  "data": {
    "id": "60bcfe4f5311236168a109cb",
    "name": "Central Bus Terminus",
    "type": "Bus Station",
    "createdAt": "2023-10-01T12:00:00Z"
  }
}
```
*Error Response (400 Bad Request):*
```json
{
  "success": false,
  "error": "Validation failed: 'location.lat' is required."
}
```

#### 3. Community Feedback & Analysis Endpoints
| Method | Endpoint | Description | Auth Required | Accessible By |
| :--- | :--- | :--- | :--- | :--- |
| POST   | `/api/feedback` | Submit community gap report | Yes | All Roles |
| GET    | `/api/feedback` | Retrieve community reports (paginated)| Yes | Admin, Planner |
| PUT    | `/api/feedback/:id/vote`| Upvote or Downvote report metrics | Yes | All Roles |
| POST   | `/api/gap/analyze`| Trigger automated gap analysis model| Yes | Admin, Planner |
| GET    | `/api/gap/reports` | Export generated gap analysis reports| Yes | All Roles |

**Example: Submit Feedback (`POST /api/feedback`)**
*Request Body (JSON):*
```json
{
  "issueType": "Missing Infrastructure",
  "description": "No operational bus stop within a crucial 2km hospital radius.",
  "severity": "High",
  "coordinates": [79.8612, 6.9271]
}
```
*Success Response (201 Created):*
```json
{
  "success": true,
  "message": "Feedback report submitted successfully.",
  "data": {
    "feedbackId": "60bcfe4f5311236168a109cc",
    "status": "Under Review"
  }
}
```
*Error Response (500 Internal Server Error):*
```json
{
  "success": false,
  "error": "Database connection timeout. Please try again later."
}
```

> [!TIP]
> **Comprehensive Swagger Environment**: In a local or staging environment, navigate to `http://localhost:5001/api-docs` while the server runs. This portal provides an openly interactive, fully specified OpenAPI endpoint catalog for live testing.

---

## 🧪 Testing Instruction Report

The project adheres to a tiered testing strategy to ensure code quality, system integrity, and performance stability.

### 2.1 Unit Testing Instruction
- **Objective**: To validate the logic of isolated utility functions and helper methods.
- **Framework**: Jest
- **Execution**: Open a terminal and navigate to the backend directory:
  ```bash
  cd backend
  ```
  Run the specific utility test suite:
  ```bash
  npm test src/tests/utils.test.js
  ```
- **Details**: These tests use mocked dependencies and do not require database access, allowing for rapid execution.

### 2.2 Integration Testing Instruction
- **Objective**: To verify the interaction between API controllers, services, and the MongoDB database.
- **Framework**: Jest & Supertest
- **Setup**: Ensure the `MONGO_URI` in your `.env` file points to a valid test database.
- **Execution**: Navigate to the backend directory:
  ```bash
  cd backend
  ```
  Run the full integration suite:
  ```bash
  npm test
  ```
- **Details**: The suite simulates HTTP methods (GET, POST, PUT, DELETE). The system automatically clears the test database after each run to maintain idempotency.

### 2.3 Performance Testing Instruction
- **Objective**: To assess system behavior and latency under heavy traffic.
- **Tool**: Artillery.io
- **Setup**: Ensure the backend server is running (locally or in production).
- **Execution**: Navigate to the backend directory:
  ```bash
  cd backend
  ```
  Execute the performance script:
  ```bash
  npm run test:performance
  ```
- **Details**: This runs a 5-minute stress test, increasing load from 2 to 10 virtual users per second. The focus is on monitoring response times (p95 and p99).

### 2.4 Testing Environment Configuration Details
The following specifications are required to maintain consistency across testing environments:

| Attribute | Specification |
| :--- | :--- |
| **Runtime** | Node.js version >= 18.0.0 |
| **Database** | MongoDB Atlas or local MongoDB Community Edition |
| **Authentication** | Ephemeral JWT tokens (automatically generated during tests) |
| **Global Timeout** | 10,000ms (configured to account for network/database latency) |
| **Variables** | `JWT_SECRET` and `MONGO_URI` must be initialized in `.env` |

---

## 🚢 Deployment Report

The TransitEquity system utilizes a decoupled, cloud-native architecture to ensure scalability and high availability. The application is split into a backend API service and a frontend client-side application.

### 1.1 Backend Deployment (Railway)
The Node.js backend is hosted on Railway, providing a robust environment for server-side logic and database management.
- **Platform**: Railway.app
- **Infrastructure**: Node.js 22.x Environment
- **Database**: MongoDB Atlas (Cloud Cluster)
- **Deployment Workflow**: 
  - **CI/CD**: Integrated with GitHub. Pushes to the `main` branch trigger automatic builds.
  - **Build/Start**: Uses `npm install` and `npm start`.
  - **Port Management**: Dynamically assigned via environment variables (defaulting to `8080`).
- **Live Endpoint**: `https://transitequity-production.up.railway.app`

### 1.2 Frontend Deployment (Vercel)
The user interface, built with React and Vite, is deployed on Vercel to leverage global Edge Network distribution.
- **Platform**: Vercel
- **Build Optimization**: Vite Production Build
- **Output Directory**: `/dist`
- **Environment Sync**: The frontend connects to the backend using the `VITE_API_BASE_URL` variable configured in the Vercel dashboard.
- **Live Endpoint**: `https://transit-equity.vercel.app/`

---

## ⚡ High Availability Maintenance

To mitigate the "cold-start" latency associated with Railway’s resource management, a Keep-Awake Engine is active:
- **Logic**: A self-health-check ping is issued every 14 minutes.
- **Implementation**: Initialized in `server.js` using the `src/utils/keepAwake.js` utility.
- **Benefit**: Ensures the API remains "warm" and responsive for immediate user requests.

---

## 🛠 Tech Stack
- **Frontend**: React, Vite, Lucide Icons, Axios, TailwindCSS.
- **Backend**: Node.js, Express, Mongoose, JSON Web Tokens.
- **Database**: MongoDB (NoSQL).
- **Quality Assurance**: Jest, Supertest, Artillery.io, Swagger.
