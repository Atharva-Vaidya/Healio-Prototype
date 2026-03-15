import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../utils/AuthContext';
import DashboardNavbar from '../employee/DashboardNavbar';
import PresentationTooltip from '../../components/PresentationTooltip';

export default function TPADashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [claims, setClaims] = useState([]);
  const [approvedPayouts, setApprovedPayouts] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [relatedInvoice, setRelatedInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all | pending | approved | rejected

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadMetrics(), loadClaims()]);
    setLoading(false);
  };

  /* ─── Data Loaders ─── */

  const loadMetrics = async () => {
    const [totalRes, pendingRes, approvedRes, valueRes] = await Promise.all([
      supabase.from('claims').select('id', { count: 'exact' }),
      supabase.from('claims').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('claims').select('id', { count: 'exact' }).eq('status', 'approved'),
      supabase.from('claims').select('amount'),
    ]);
    const totalValue = (valueRes.data || []).reduce((s, c) => s + Number(c.amount), 0);
    setMetrics({
      total: totalRes.count || 0,
      pending: pendingRes.count || 0,
      approved: approvedRes.count || 0,
      totalValue,
    });
  };

  const loadClaims = async () => {
    const { data } = await supabase
      .from('claims')
      .select('*, users:user_id(name, email)')
      .order('created_at', { ascending: false });
    const all = data || [];
    setClaims(all);
    setApprovedPayouts(all.filter(c => c.status === 'approved'));
    detectFraud(all);
  };

  /* ─── Fraud Detection ─── */

  const detectFraud = (claimsList) => {
    const suspicious = [];
    // Rule 1: Same hospital, multiple claims in short window
    const hospGrouped = {};
    claimsList.forEach(c => {
      const key = c.hospital;
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
    // Rule 2: High value claims (>₹10,000)
    claimsList.forEach(c => {
      if (Number(c.amount) > 10000 && !suspicious.find(s => s.id === c.id)) {
        suspicious.push({ ...c, reason: 'High-value claim (>₹10,000)' });
      }
    });
    setFraudAlerts(suspicious);
  };

  /* ─── Claim Actions ─── */

  const handleClaimAction = async (claimId, status) => {
    setActionLoading(claimId);
    await supabase.from('claims').update({ status }).eq('id', claimId);
    await loadAll();
    setActionLoading(null);
    if (selectedClaim?.id === claimId) setSelectedClaim(null);
  };

  const openClaimDetail = async (claim) => {
    setSelectedClaim(claim);
    setRelatedInvoice(null);
    // Try to find related clinic invoice
    if (claim.user_id) {
      const { data } = await supabase
        .from('clinic_invoices')
        .select('*, clinics:clinic_id(name)')
        .eq('patient_id', claim.user_id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setRelatedInvoice(data[0]);
    }
  };

  /* ─── Helpers ─── */

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  const isSuspicious = (id) => fraudAlerts.some(a => a.id === id);
  const fraudReason = (id) => fraudAlerts.find(a => a.id === id)?.reason;

  const filteredClaims = activeTab === 'all' ? claims : claims.filter(c => c.status === activeTab);

  const statusBadge = (status) => {
    const map = {
      approved: 'bg-emerald-50 text-emerald-700',
      rejected: 'bg-red-50 text-red-600',
      pending: 'bg-amber-50 text-amber-700',
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  };

  /* ─── Loading State ─── */

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <DashboardNavbar title="TPA Claims Dashboard" onMenuToggle={() => {}} />
        <div className="flex justify-center py-24">
          <svg className="animate-spin h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      </div>
    );
  }

  /* ─── Render ─── */

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <DashboardNavbar title="TPA Claims Dashboard" onMenuToggle={() => {}} />
      <main className="px-4 py-8 max-w-7xl mx-auto space-y-6">

        {/* ──── Metric Cards ──── */}
        <PresentationTooltip title="Claims Pipeline Overview" description="Real-time KPIs computed from the claims table — total submissions, pending queue, approved count, and cumulative claim value." position="bottom" className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold">All-time submissions</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-2xl shadow-sm text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-amber-100 uppercase tracking-wider">Pending Review</p>
                <p className="text-2xl font-bold">{metrics.pending}</p>
              </div>
            </div>
            <p className="text-[10px] text-amber-100 font-bold">Awaiting adjudication</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-bold text-emerald-700">{metrics.approved}</p>
              </div>
            </div>
            <p className="text-[10px] text-emerald-500 font-bold">Claims cleared</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Value</p>
                <p className="text-2xl font-bold text-teal-700">{fmt(metrics.totalValue)}</p>
              </div>
            </div>
            <p className="text-[10px] text-teal-500 font-bold">Cumulative claim amount</p>
          </div>
        </div>
        </PresentationTooltip>

        {/* ──── Claims Adjudication Queue ──── */}
        <PresentationTooltip title="Claims Adjudication Engine" description="The core TPA workflow — review, approve, or reject claims in real-time. Each action writes directly to the Supabase claims table. Click any row to see full claim details and related invoices." position="bottom" className="w-full">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              Claims Adjudication Queue
            </h2>
            {/* Filter Tabs */}
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              {['all', 'pending', 'approved', 'rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                    activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >{tab}</button>
              ))}
            </div>
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
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risk</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClaims.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No claims found.</td></tr>
                ) : filteredClaims.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => openClaimDetail(c)}
                    className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${isSuspicious(c.id) ? 'bg-red-50/30' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-bold text-gray-800">{c.users?.name || '—'}</p>
                      <p className="text-[10px] text-gray-400">{c.users?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600 font-medium">{c.hospital}</td>
                    <td className="px-5 py-3 text-xs text-gray-600">{c.treatment}</td>
                    <td className="px-5 py-3 text-sm font-bold text-gray-800">{fmt(c.amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider ${statusBadge(c.status)}`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3 text-[10px] text-gray-400 font-medium">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      {isSuspicious(c.id) ? (
                        <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase" title={fraudReason(c.id)}>⚠ Flagged</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">✓ Clear</span>
                      )}
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ──── Approved Payouts ──── */}
          <PresentationTooltip title="Payout Ledger" description="All approved claims ready for settlement. This table drives the payout pipeline and is filterable for finance reconciliation." position="bottom" className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Approved Payouts
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">{approvedPayouts.length} payouts</span>
            </div>
            <div className="overflow-x-auto max-h-[320px]">
              <table className="w-full text-left">
                <thead className="bg-gray-50/70 sticky top-0">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hospital</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Treatment</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {approvedPayouts.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No approved payouts yet.</td></tr>
                  ) : approvedPayouts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-xs font-medium text-gray-600">{p.hospital}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{p.treatment}</td>
                      <td className="px-5 py-3 text-sm font-bold text-emerald-700">{fmt(p.amount)}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">{p.users?.name}</td>
                      <td className="px-5 py-3 text-[10px] text-gray-400 font-medium">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </PresentationTooltip>

          {/* ──── Fraud Detection Widget ──── */}
          <PresentationTooltip title="Fraud Intelligence" description="Automatically flags claims with suspicious patterns — multiple claims from the same hospital and high-value outliers above ₹10,000." position="left">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Fraud Alerts</h2>
              {fraudAlerts.length > 0 && (
                <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full ml-auto">{fraudAlerts.length}</span>
              )}
            </div>
            <div className="p-5 space-y-3 max-h-[320px] overflow-y-auto">
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

      {/* ──── Claim Detail Modal ──── */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedClaim(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide">Claim Details</h3>
              <button onClick={() => setSelectedClaim(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Employee</p>
                  <p className="text-sm font-bold text-gray-800">{selectedClaim.users?.name || '—'}</p>
                  <p className="text-[10px] text-gray-400">{selectedClaim.users?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hospital</p>
                  <p className="text-sm font-bold text-gray-800">{selectedClaim.hospital}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Treatment</p>
                  <p className="text-sm text-gray-600">{selectedClaim.treatment}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-sm font-bold text-teal-700">{fmt(selectedClaim.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Submitted</p>
                  <p className="text-sm text-gray-600">{new Date(selectedClaim.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider ${statusBadge(selectedClaim.status)}`}>{selectedClaim.status}</span>
                </div>
              </div>

              {isSuspicious(selectedClaim.id) && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-xs font-bold text-red-700 flex items-center gap-1">⚠ Fraud Alert</p>
                  <p className="text-[10px] text-red-600 mt-1">{fraudReason(selectedClaim.id)}</p>
                </div>
              )}

              {relatedInvoice && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 mb-1">Related Clinic Invoice</p>
                  <p className="text-[10px] text-blue-600">Treatment: {relatedInvoice.treatment} · {fmt(relatedInvoice.amount)}</p>
                  <p className="text-[10px] text-blue-500">Clinic: {relatedInvoice.clinics?.name || 'Unknown'} · {new Date(relatedInvoice.created_at).toLocaleDateString()}</p>
                </div>
              )}

              {selectedClaim.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleClaimAction(selectedClaim.id, 'approved')}
                    disabled={actionLoading === selectedClaim.id}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >Approve Claim</button>
                  <button
                    onClick={() => handleClaimAction(selectedClaim.id, 'rejected')}
                    disabled={actionLoading === selectedClaim.id}
                    className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-red-500/20"
                  >Reject Claim</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
