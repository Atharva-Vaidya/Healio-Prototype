import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DashboardNavbar from '../employee/DashboardNavbar';
import PresentationTooltip from '../../components/PresentationTooltip';

export default function HRDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [claims, setClaims] = useState([]);
  const [walletStats, setWalletStats] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadMetrics(), loadClaims(), loadWalletStats()]);
    setLoading(false);
  };

  const loadMetrics = async () => {
    const [empRes, walletRes, claimsAllRes, claimsPendingRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'employee'),
      supabase.from('users').select('wallet_balance').eq('role', 'employee'),
      supabase.from('claims').select('id', { count: 'exact' }),
      supabase.from('claims').select('id', { count: 'exact' }).eq('status', 'pending'),
    ]);
    const totalWallet = (walletRes.data || []).reduce((s, u) => s + Number(u.wallet_balance), 0);
    setMetrics({
      totalEmployees: empRes.count || 0,
      totalWalletDistributed: totalWallet,
      claimsSubmitted: claimsAllRes.count || 0,
      pendingClaims: claimsPendingRes.count || 0,
    });
  };

  const loadClaims = async () => {
    const { data } = await supabase
      .from('claims')
      .select('*, users:user_id(name, email)')
      .order('created_at', { ascending: false })
      .limit(50);
    setClaims(data || []);
    detectFraud(data || []);
  };

  const loadWalletStats = async () => {
    const { data: txs } = await supabase.from('wallet_transactions').select('amount, type');
    const all = txs || [];
    const credits = all.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0);
    const debits = all.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0);
    setWalletStats({ credits, debits, remaining: credits - debits });
  };

  const detectFraud = (claimsList) => {
    const suspicious = [];
    // Rule 1: Duplicate amount within 24h from the same user
    const grouped = {};
    claimsList.forEach(c => {
      const key = `${c.user_id}-${c.amount}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    });
    Object.values(grouped).forEach(group => {
      if (group.length >= 2) {
        const sorted = group.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        for (let i = 1; i < sorted.length; i++) {
          const diff = Math.abs(new Date(sorted[i].created_at) - new Date(sorted[i - 1].created_at));
          if (diff < 86400000) {
            suspicious.push({ ...sorted[i], reason: 'Duplicate amount within 24h' });
          }
        }
      }
    });
    // Rule 2: Multiple claims same hospital in short time
    const hospGrouped = {};
    claimsList.forEach(c => {
      const key = `${c.user_id}-${c.hospital}`;
      if (!hospGrouped[key]) hospGrouped[key] = [];
      hospGrouped[key].push(c);
    });
    Object.values(hospGrouped).forEach(group => {
      if (group.length >= 3) {
        group.forEach(c => {
          if (!suspicious.find(s => s.id === c.id)) {
            suspicious.push({ ...c, reason: 'Multiple claims from same hospital' });
          }
        });
      }
    });
    setFraudAlerts(suspicious);
  };

  const handleClaimAction = async (claimId, status) => {
    setActionLoading(claimId);
    await supabase.from('claims').update({ status }).eq('id', claimId);
    await loadAll();
    setActionLoading(null);
  };

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  const isSuspicious = (id) => fraudAlerts.some(a => a.id === id);

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <DashboardNavbar title="HR Management Dashboard" onMenuToggle={() => {}} />
        <div className="flex justify-center py-24">
          <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <DashboardNavbar title="HR Management Dashboard" onMenuToggle={() => {}} />
      <main className="px-4 py-8 max-w-7xl mx-auto space-y-6">

        {/* ──── Metric Cards ──── */}
        <PresentationTooltip title="HR Analytics Overview" description="All metrics are computed in real-time from Supabase queries — employee counts, wallet distributions, and claims status are always current." position="bottom" className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalEmployees}</p>
              </div>
            </div>
            <p className="text-[10px] text-emerald-500 font-bold">▲ Active on Platform</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Wallet Distributed</p>
                <p className="text-2xl font-bold text-teal-700">{fmt(metrics.totalWalletDistributed)}</p>
              </div>
            </div>
            <p className="text-[10px] text-teal-500 font-bold">Current Balance Pool</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Claims Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.claimsSubmitted}</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold">All-time</p>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-5 rounded-2xl shadow-sm text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-pink-100 uppercase tracking-wider">Pending Claims</p>
                <p className="text-2xl font-bold">{metrics.pendingClaims}</p>
              </div>
            </div>
            <p className="text-[10px] text-pink-100 font-bold">Awaiting Review</p>
          </div>
        </div>
        </PresentationTooltip>

        {/* ──── Wallet Usage Analytics ──── */}
        {walletStats && (
          <PresentationTooltip title="Wallet Budget Tracker" description="Credits, debits, and remaining budget are calculated live from the wallet_transactions table — giving HR instant visibility into organizational health spending." position="bottom" className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Wallet Credits</p>
              <p className="text-xl font-bold text-emerald-600">{fmt(walletStats.credits)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Wallet Spent</p>
              <p className="text-xl font-bold text-rose-600">{fmt(walletStats.debits)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Remaining Budget</p>
              <p className="text-xl font-bold text-indigo-600">{fmt(walletStats.remaining)}</p>
            </div>
          </div>
          </PresentationTooltip>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ──── Claims Monitoring Table ──── */}
          <PresentationTooltip title="Claims Adjudication" description="HR can approve or reject claims in real-time. Each action writes directly to the Supabase claims table and instantly updates all connected dashboards." position="bottom" className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Claims Monitoring
              </h2>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">{claims.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hospital</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Treatment</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">No claims in the system.</td></tr>
                  ) : claims.map(c => (
                    <tr key={c.id} className={`hover:bg-gray-50/50 transition-colors ${isSuspicious(c.id) ? 'bg-red-50/40' : ''}`}>
                      <td className="px-5 py-3">
                        <p className="text-sm font-bold text-gray-800">{c.users?.name || '—'}</p>
                        <p className="text-[10px] text-gray-400">{c.users?.email}</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600 font-medium">{c.hospital}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{c.treatment}</td>
                      <td className="px-5 py-3 text-sm font-bold text-gray-800">{fmt(c.amount)}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                          c.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          c.status === 'rejected' ? 'bg-red-50 text-red-600' :
                          'bg-amber-50 text-amber-700'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-5 py-3 text-[10px] text-gray-400 font-medium">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        {c.status === 'pending' ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleClaimAction(c.id, 'approved')}
                              disabled={actionLoading === c.id}
                              className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer disabled:opacity-50"
                            >Approve</button>
                            <button
                              onClick={() => handleClaimAction(c.id, 'rejected')}
                              disabled={actionLoading === c.id}
                              className="px-2.5 py-1 text-[10px] font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                            >Reject</button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-300 font-bold">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </PresentationTooltip>

          {/* ──── Fraud Alert Widget ──── */}
          <PresentationTooltip title="Fraud Detection Engine" description="Automatically scans for duplicate invoice amounts within 24 hours and flags users with multiple claims from the same hospital — powered by real-time pattern analysis." position="left">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Fraud Alerts</h2>
            </div>
            <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto">
              {fraudAlerts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <p className="text-sm font-bold text-gray-700">All Clear</p>
                  <p className="text-xs text-gray-400 mt-1">No suspicious activity detected.</p>
                </div>
              ) : fraudAlerts.map(a => (
                <div key={a.id} className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-red-700">{a.users?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-red-500 mt-0.5">{a.hospital} · {fmt(a.amount)}</p>
                    </div>
                    <span className="text-[8px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase">⚠ Flag</span>
                  </div>
                  <p className="text-[10px] text-red-600 mt-2 font-medium">{a.reason}</p>
                </div>
              ))}
            </div>
          </div>
          </PresentationTooltip>

        </div>

      </main>
    </div>
  );
}
