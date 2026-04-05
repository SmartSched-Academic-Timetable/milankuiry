import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import OrganizationRegister from './pages/OrganizationRegister';
import UserRegister from './pages/UserRegister';
import OrganizationLogin from './pages/OrganizationLogin';
import UserLogin from './pages/UserLogin';
import AdminDashboard from './pages/AdminDashboard';
import TimetableGenerator from './pages/TimetableGenerator';
import GeneratedTimetable from './pages/GeneratedTimetable';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/org-register" element={<OrganizationRegister />} />
          <Route path="/user-register" element={<UserRegister />} />
          <Route path="/org-login" element={<OrganizationLogin />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route
            path="/timetable-generator"
            element={<TimetableGenerator />}
          />
          <Route path="/timetable" element={<GeneratedTimetable />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
