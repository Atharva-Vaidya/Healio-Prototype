import { ROLES } from '../utils/roles';

const demoAccounts = [
  { role: 'Employee', email: 'employee@demo.com', icon: '👤', authRole: ROLES.EMPLOYEE },
  { role: 'HR Manager', email: 'hr@demo.com', icon: '🏢', authRole: ROLES.HR_MANAGER },
  { role: 'Clinic', email: 'clinic@demo.com', icon: '🏥', authRole: ROLES.CLINIC },
  { role: 'TPA', email: 'tpa@demo.com', icon: '📋', authRole: ROLES.TPA },
];

export default function DemoCredentials({ onSelectAccount }) {
  return (
    <div className="mt-6 animate-fade-in-up stagger-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 backdrop-blur-sm p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Demo Accounts
          </span>
          <span className="text-[10px] text-amber-600 ml-auto">
            Click to fill
          </span>
        </div>

        {/* Account list */}
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map(({ role, email, icon, authRole }) => (
            <button
              key={role}
              type="button"
              onClick={() => onSelectAccount(email, authRole)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-amber-100 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200 text-left group cursor-pointer"
            >
              <span className="text-sm">{icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-700 group-hover:text-amber-800 transition-colors">
                  {role}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{email}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-amber-600/70 mt-2 text-center">
          Password for all: <span className="font-mono font-semibold">demo1234</span>
        </p>
      </div>
    </div>
  );
}
