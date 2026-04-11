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

The API supports **JSON** request/response formats. Most administrative endpoints require a **JSON Web Token (JWT)** passed in the `Authorization` header as `Bearer <token>` or via cookies.

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Authenticate and get token | No |
| GET  | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/logout` | Clear session | Yes |

### Infrastructure Management
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| GET    | `/api/facilities` | List facilities (paginated) | All authenticated |
| POST   | `/api/facilities` | Create new facility | Admin / iOfficer |
| GET    | `/api/areas` | List areas (paginated) | All authenticated |
| POST   | `/api/areas` | Create new area | Admin |
| GET    | `/api/transports` | List transit routes (paginated) | All authenticated |
| POST   | `/api/transports` | Create new transit route | Admin |

### Community & Analysis
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| GET    | `/api/feedback` | List community reports (paginated) | Admin |
| POST   | `/api/feedback` | Submit new community report | All authenticated |
| PUT    | `/api/feedback/:id/vote` | Upvote/Downvote report | All authenticated |
| POST   | `/api/gap/analyze` | Trigger automated gap analysis | Admin / Planner |
| GET    | `/api/gap/reports` | View generated gap reports | All authenticated |

> [!TIP]
> **Detailed Swagger Documentation**: Browse to `http://localhost:5001/api-docs` while the server is running for interactive endpoint testing.

---

## 🧪 Testing Instruction Report

### i. Unit Testing
- **Goal**: Validate isolated logic (e.g., input validation, scoring algorithms).
- **Execution**:
  ```bash
  npm test src/tests/utils.test.js
  ```
- **Context**: These tests use `Mock HTTP` objects and do not require a database connection.

### ii. Integration Testing
- **Goal**: Verify that controllers, services, and MongoDB work together correctly.
- **Execution**:
  ```bash
  npm test
  ```
- **Setup**:
  - Requires a working `MONGO_URI` in `.env`.
  - The test suite uses **Supertest** to simulate API calls and resets the database after each run.

### iii. Performance Testing
- **Goal**: Evaluate API response times and throughput under load.
- **Execution**:
  ```bash
  # Ensure the backend server is running first
  npm run test:performance
  ```
- **Context**: Uses **Artillery.io**. The test lasts 5 minutes, ramping up from 2 to 10 users/sec.

### iv. Testing Environment Configuration
- **Database**: Tests use the same database connection as configured in `.env`. It is recommended to use a separate "Test" database on MongoDB Atlas.
- **Timeout**: Integration tests have a default timeout of 10,000ms to allow for database latency.

---

## 🚢 Deployment Report

### Backend: Render Deployment
1. **GitHub Connection**: Connect your repository to Render.
2. **Environment**: Select `Node`.
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: (Your production MongoDB connection string)
   - `JWT_SECRET`: (A strong random string)
   - `CLIENT_URL`: `https://your-frontend.vercel.app`

### Frontend: Vercel Deployment
1. **Framework Preset**: `Vite`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com`
   - `VITE_GOOGLE_MAPS_API_KEY`: (Your Maps API Key)

---

## 🛠 Tech Stack
- **Frontend**: React, Vite, Lucide Icons, Axios, TailwindCSS.
- **Backend**: Node.js, Express, Mongoose, JSON Web Tokens.
- **Database**: MongoDB (NoSQL).
- **Quality Assurance**: Jest, Supertest, Artillery.io, Swagger.
