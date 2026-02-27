# TransitEquity Backend

TransitEquity is a backend system designed to manage transit data, analyze coverage gaps, and collect user feedback to improve public transportation equity.

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB instance

### Installation
1. Clone the repository and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the following template:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

### Running the Application
- **Development Mode** (with nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

### Running Tests
Execute the integration test suite using Jest:
```bash
npm test
```

## API Documentation

The API follows RESTful principles. Authentication is handled via JWT stored in cookies or Bearer tokens.

### Interactive Documentation
A Swagger UI is available for interactive exploration:
- **URL**: `http://localhost:5001/api-docs`

---

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/me` | User | Get current user profile |

---

### 2. User Management (`/api/users`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| GET | `/` | Admin | Get all users |
| GET | `/pending` | Admin | Get unapproved users |
| PUT | `/:id/approve` | Admin | Approve a pending user |

---

### 3. Area Management (`/api/areas`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/` | Admin | Create a new transit area |
| GET | `/` | User | Get all areas |
| GET | `/:id` | User | Get area details |
| PUT | `/:id` | Admin | Update area details |
| DELETE | `/:id` | Admin | Delete an area |

---

### 4. Facility Management (`/api/facilities`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/` | Admin/iOfficer | Create a facility (Bus Stop, Station, etc.) |
| GET | `/` | User | List all facilities |
| GET | `/:id` | User | Get facility details |
| PUT | `/:id` | Admin/iOfficer | Update facility |
| DELETE | `/:id` | Admin/iOfficer | Delete facility |

---

### 5. Transport & Route Management (`/api/transports`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/` | Admin/tOfficer | Create a transport route |
| GET | `/` | User | List all routes |
| GET | `/:id` | User | Get route details |
| PUT | `/:id` | Admin/tOfficer | Update route |
| DELETE | `/:id` | Admin/tOfficer | Delete route |

---

### 6. Service Status Tracking (`/api/services`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/` | Admin/tOfficer | Create a service status record |
| GET | `/` | User | List all service statuses |
| GET | `/active` | User | Get active services |
| GET | `/delayed` | User | Get delayed services |
| PUT | `/:id` | Admin/tOfficer | Update status (Active, Delayed, etc.) |
| DELETE | `/:id` | Admin/tOfficer | Delete status record |

---

### 7. Feedback Module (`/api/feedback`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/` | Public | Submit new feedback |
| GET | `/` | Public | Get all feedback (sorted by priority) |
| GET | `/:id` | Public | Get feedback details |
| PUT | `/:id/vote` | Public | Upvote a feedback |
| PUT | `/:id` | Officer/Admin | Update feedback status |
| DELETE | `/:id` | Admin | Delete feedback |

---

### 8. Gap Analysis (`/api/gap`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| POST | `/analyze` | Admin/Planner | Trigger gap analysis for an area |
| GET | `/reports` | User | Get all gap reports |
| GET | `/reports/:id` | User | Get individual report details |
| DELETE | `/reports/:id` | Admin | Delete a report |

---

## Postman Collection
A pre-configured Postman collection is available at `backend/feedback_tests.postman_collection.json` for manual testing.
