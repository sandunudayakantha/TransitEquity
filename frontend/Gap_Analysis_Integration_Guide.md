# Integrating the Gap Analysis Frontend

Follow these explicit instructions to cleanly integrate the assembled Transportation Gap Analysis components directly into your active React application environment.

### 1. Finalize Dependency Engine
If not completely synchronized, ensure the following core dependencies are firmly tracking inside your frontend `package.json`:
```bash
npm install leaflet leaflet.heat react-leaflet react-hot-toast axios react-router-dom
```

### 2. Configure Environment Routing
Add your explicit Backend API structural anchor securely pointing locally (or to production instances) inside your frontend `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5001
# (Or REACT_APP_API_URL if utilizing Create-React-App structures)
```

### 3. Establish Axios Interceptor Logic
Guarantee your `axios` instance dynamically merges the verified Authentication JWT credentials. This protects your Gap Engine APIs from blocking 401s natively context-wide:
```javascript
import axios from 'axios';
import { loadAuthSession } from './auth';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use((config) => {
   const session = loadAuthSession();
   if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
   }
   return config;
});

export default api;
```

### 4. Router Injection
To safely surface the dashboard while strictly protecting unauthorized endpoints dynamically, inject the completed `GapAnalysisPage` route directly behind the `react-router-dom` block inside `App.jsx` or `main.jsx`:
```jsx
// src/App.jsx or src/main.jsx
import { Routes, Route } from 'react-router-dom';
import GapAnalysisPage from './pages/GapAnalysisPage';

function App() {
  return (
    <Routes>
       {/* ... Your existing router nodes ... */}
       <Route path="/gap-analysis" element={<GapAnalysisPage />} />
    </Routes>
  );
}
```
*Note*: You do **not** need to wrap `<GapProvider>` around the whole root app, `GapAnalysisPage.jsx` internally manages isolation securely.

### 5. Critical Third-Party CSS Mapping
For the interactive Map blocks visually anchoring, make absolute sure `Leaflet.js` stylesheet mappings natively wrap around your application runtime (Drop this into `main.jsx` / `App.jsx` or your root entry point):
```javascript
// React Global Inject:
import 'leaflet/dist/leaflet.css';
```

---

### 6. Testing Checklist
Complete this testing sequence mapping out correct frontend integration flawlessly:

- [ ] **Gatekeeper Protection**: Authenticate locally as a regular `citizen`. Attempt to access `http://localhost:5173/gap-analysis`. Ensure the engine aggressively halts displaying the *Access Restricted* warning securely mapping back to Feedback routes safely.
- [ ] **Privileged Access Check**: Re-authenticate logging in strictly as an `admin` or `planner`. Ascertain whether `AreaSelector` dropdown natively fetches and surfaces available transit regions smoothly.
- [ ] **Processing Feedback**: Pick an area and click "Compute Gap Scores". Verify that the visual spinner actuates securely triggering a native top-aligned popup notification utilizing `react-hot-toast`.
- [ ] **Array Validations**: Confirm `GapReportTable` successfully builds UI strings parsing Population statistics natively separating digits utilizing cleanly minted Severity colored Pills.
- [ ] **Mapping Integrations**: Verify the right-panel `GapHeatmap` Geographic matrix anchors exactly focusing globally bridging `[7.8731, 80.7718]` and mapping Ghost Leaflet tooltips tracking custom Gap Scores seamlessly.
- [ ] **Memory Export Blocks**: Hit `Export CSV` while searching actively filtered items. Ensure native CSVs download quickly matching precise column dimensions via MS Excel perfectly.
