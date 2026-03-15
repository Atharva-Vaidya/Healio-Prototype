import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import { ROLES } from './utils/roles';
import ProtectedRoute from './routes/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './components/LoginPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import HRDashboard from './pages/hr/HRDashboard';
import ClinicDashboard from './pages/clinic/ClinicDashboard';
import TPADashboard from './pages/tpa/TPADashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import MedicalHistory from './pages/employee/MedicalHistory';
import ProviderMap from './pages/ProviderMap';
import { PresentationProvider } from './utils/PresentationContext';
import PresentationModeToggle from './components/PresentationModeToggle';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PresentationProvider>
          <Routes>
            {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard/employee"
            element={
              <ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/employee/medical-history"
            element={
              <ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]}>
                <MedicalHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinics"
            element={
              <ProtectedRoute allowedRoles={[ROLES.EMPLOYEE, ROLES.HR_MANAGER]}>
                <ProviderMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/hr"
            element={
              <ProtectedRoute allowedRoles={[ROLES.HR_MANAGER]}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/clinic"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CLINIC]}>
                <ClinicDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tpa"
            element={
              <ProtectedRoute allowedRoles={[ROLES.TPA]}>
                <TPADashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

            {/* Catch-all: redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <PresentationModeToggle />
        </PresentationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
