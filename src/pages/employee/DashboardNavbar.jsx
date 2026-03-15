import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import NotificationBell from '../../components/NotificationBell';
import GlobalSearch from '../../components/GlobalSearch';

export default function DashboardNavbar({ title, onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30">
      {/* Brand strip */}
      <div className="h-1 bg-gradient-to-r from-gray-300 via-gray-100 to-white" />
      <div className="backdrop-blur-md border-b border-gray-200/80 shadow-sm" style={{ backgroundColor: '#c8faf4' }}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left: Hamburger + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{title}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Welcome back! Here's your health overview.</p>
            </div>
          </div>

          {/* Right: Search + Notifications + Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 w-56 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder:text-gray-400"
              />
            </div>

            {/* Mobile search */}
            <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* Profile + Logout */}
            <div className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-700 leading-tight">{user?.name || 'User'}</p>
                <p className="text-[11px] text-gray-400 leading-tight capitalize">{user?.role || 'User'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-1 p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
