import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { ROLE_CONFIG } from '../utils/roles';

export default function DashboardLayout({ children, title, role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const config = ROLE_CONFIG[role];

  const colorMap = {
    teal:    { gradient: 'from-teal-500 to-cyan-600',    bg: 'bg-teal-50',  text: 'text-teal-700',  border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700' },
    indigo:  { gradient: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700' },
    emerald: { gradient: 'from-emerald-500 to-teal-600',  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
    amber:   { gradient: 'from-amber-500 to-orange-600',  bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
    rose:    { gradient: 'from-rose-500 to-pink-600',     bg: 'bg-rose-50',  text: 'text-rose-700',  border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700' },
  };
  const colors = colorMap[config?.color] || colorMap.teal;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Mobile menu */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>

              {/* Logo */}
              <Link to="/login" className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center shadow-sm`}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-800 tracking-tight">Healio</span>
              </Link>

              {/* Role badge */}
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                <span>{config?.icon}</span>
                {config?.label}
              </span>
            </div>

            {/* Right: User info + Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-0 bg-black/30" />
          <div className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border mb-4`}>
              <p className="text-sm font-semibold flex items-center gap-2">
                <span>{config?.icon}</span> {config?.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
            </div>
            <p className="text-xs text-gray-400 px-2 mb-2 uppercase tracking-wide font-semibold">Navigation</p>
            <div className="space-y-1">
              <div className={`px-3 py-2 rounded-lg ${colors.bg} ${colors.text} text-sm font-medium`}>
                Dashboard
              </div>
              <div className="px-3 py-2 rounded-lg text-gray-500 text-sm hover:bg-gray-50 cursor-pointer">
                Profile
              </div>
              <div className="px-3 py-2 rounded-lg text-gray-500 text-sm hover:bg-gray-50 cursor-pointer">
                Settings
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-2xl">{config?.icon}</span>
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{config?.description}</p>
        </div>

        {children}
      </main>
    </div>
  );
}
