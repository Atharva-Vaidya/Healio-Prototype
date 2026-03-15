import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import DashboardNavbar from '../employee/DashboardNavbar';
import ActivityFeed from '../../components/ActivityFeed';
import DemoDataGenerator from '../../services/DemoDataGenerator';
import PresentationTooltip from '../../components/PresentationTooltip';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await adminService.getAdminDashboardData();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <DashboardNavbar title="Healio Administration" onMenuToggle={() => {}} />
      <main className="px-4 py-8 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-end mb-4">
          <DemoDataGenerator onComplete={() => loadData()} />
        </div>
        
        {loading || !data ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : (
          <>
            {/* System Status Cards */}
            <PresentationTooltip title="Platform Health Metrics" description="System-wide metrics pulled from all Supabase tables in real-time — users, providers, claims, transactions, and total healthcare spending." position="bottom" className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalUsers}</p>
                <p className="text-[10px] text-emerald-500 font-bold mt-1">▲ Active Platform Users</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider relative z-10">Provider Network</p>
                <p className="text-3xl font-bold text-indigo-600 relative z-10">{data.totalClinics}</p>
                <p className="text-[10px] text-indigo-500 font-bold mt-1 relative z-10">Verified Clinics</p>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-50 rounded-full opacity-50 z-0"></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Claims</p>
                <p className="text-3xl font-bold text-amber-600">{data.totalClaims}</p>
                <p className="text-[10px] text-amber-500 font-bold mt-1">Processed Insurance</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Transactions</p>
                <p className="text-3xl font-bold text-teal-600">{data.totalTransactions}</p>
                <p className="text-[10px] text-teal-500 font-bold mt-1">Wallet Deductions</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                <p className="text-xs font-bold text-indigo-200 mb-1 uppercase tracking-wider">Global Spend</p>
                <p className="text-3xl font-bold">{formatCurrency(data.totalHealthcareSpending)}</p>
                <p className="text-[10px] text-indigo-100 font-bold mt-1">Total System Burn</p>
              </div>
            </div>
            </PresentationTooltip>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              
              <div className="lg:col-span-2 space-y-6">
                
                {/* Users Table */}
                <PresentationTooltip title="User Management" description="Complete registry of all platform users with role-based badges. All data is live from the Supabase users table." position="bottom" className="w-full">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Platform Users</h2>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded cursor-pointer">View All</span>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.users.map(u => (
                        <tr key={u.id}>
                          <td className="px-6 py-3 text-sm flex flex-col">
                            <span className="font-bold text-gray-800">{u.name}</span>
                            <span className="text-xs text-gray-500">{u.email}</span>
                          </td>
                          <td className="px-6 py-3 text-xs">
                            <span className={`px-2 py-1 rounded font-bold uppercase tracking-wider text-[9px] ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              u.role === 'clinic' ? 'bg-teal-100 text-teal-700' :
                              u.role === 'hr' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{u.role}</span>
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-500 font-medium">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </PresentationTooltip>

                {/* Clinics Table */}
                <PresentationTooltip title="Provider Network" description="All verified healthcare providers in the Healio network, sourced from the clinics table with real-time ratings." position="top" className="w-full">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Verified Provider Network</h2>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Provider Name</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.clinics.map(c => (
                        <tr key={c.id}>
                          <td className="px-6 py-3 text-sm font-bold text-gray-800">{c.name}</td>
                          <td className="px-6 py-3 text-xs text-gray-500 font-medium">{c.location}</td>
                          <td className="px-6 py-3 text-xs font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                            ★ {c.rating}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </PresentationTooltip>
              </div>

              <div className="lg:col-span-1">
                {/* Global Activity Feed */}
                <PresentationTooltip title="Live Activity Feed" description="Real-time activity stream showing all user interactions across the platform — logins, transactions, claims, and system events." position="left">
                <ActivityFeed />
                </PresentationTooltip>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
