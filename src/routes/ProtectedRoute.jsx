import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

/**
 * ProtectedRoute — Guards dashboard routes based on authentication and role.
 *
 * Usage:
 *   <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]} />}>
 *     <Route path="employee" element={<EmployeeDashboard />} />
 *   </Route>
 *
 * TODO: When Gemini backend is integrated, also validate the JWT
 * token server-side before rendering protected content.
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuth();

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not authorized → show unauthorized page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-6">
            You don't have permission to access this page. Please contact your administrator.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return children;
}
