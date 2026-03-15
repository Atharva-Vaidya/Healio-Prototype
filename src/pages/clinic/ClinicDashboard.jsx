import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { clinicService } from '../../services/clinicService';
import DashboardNavbar from '../employee/DashboardNavbar';
import PresentationTooltip from '../../components/PresentationTooltip';

export default function ClinicDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invoice form
  const [patientEmail, setPatientEmail] = useState('');
  const [treatment, setTreatment] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  // Claim form
  const [claimPatientEmail, setClaimPatientEmail] = useState('');
  const [claimHospital, setClaimHospital] = useState('');
  const [claimTreatment, setClaimTreatment] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [claimMsg, setClaimMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user?.id) loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadMetrics(), loadInvoices()]);
    setLoading(false);
  };

  const loadMetrics = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [invoicesTodayRes, revenueRes, pendingRes, ratingRes] = await Promise.all([
      supabase.from('clinic_invoices').select('id', { count: 'exact' }).eq('clinic_id', user.id).gte('created_at', today.toISOString()),
      supabase.from('clinic_invoices').select('amount').eq('clinic_id', user.id),
      supabase.from('claims').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('clinics').select('rating'),
    ]);

    const totalRevenue = (revenueRes.data || []).reduce((s, r) => s + Number(r.amount), 0);
    const ratings = (ratingRes.data || []).filter(c => c.rating);
    const avgRating = ratings.length > 0 ? (ratings.reduce((s, c) => s + Number(c.rating), 0) / ratings.length).toFixed(1) : '—';

    setMetrics({
      todayPatients: invoicesTodayRes.count || 0,
      totalRevenue,
      pendingClaims: pendingRes.count || 0,
      avgRating,
    });
  };

  const loadInvoices = async () => {
    const data = await clinicService.getClinicInvoices(user.id);
    setInvoices(data || []);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!patientEmail || !treatment || !amount) return;
    setIsSubmitting(true);
    setFormMsg({ type: '', text: '' });
    try {
      await clinicService.generateInvoice(user.id, user.name, patientEmail, treatment, description, amount);
      setFormMsg({ type: 'success', text: 'Invoice generated! Patient wallet has been debited.' });
      setPatientEmail(''); setTreatment(''); setDescription(''); setAmount('');
      loadAll();
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimPatientEmail || !claimTreatment || !claimAmount) return;
    setIsClaimSubmitting(true);
    setClaimMsg({ type: '', text: '' });
    try {
      const { data: patient } = await supabase.from('users').select('id').eq('email', claimPatientEmail).single();
      if (!patient) throw new Error('Patient not found.');
      await supabase.from('claims').insert([{
        user_id: patient.id,
        hospital: claimHospital || user.name,
        treatment: claimTreatment,
        amount: Number(claimAmount),
        status: 'pending',
      }]);
      setClaimMsg({ type: 'success', text: 'Insurance claim submitted to TPA successfully!' });
      setClaimPatientEmail(''); setClaimHospital(''); setClaimTreatment(''); setClaimAmount('');
      loadAll();
    } catch (err) {
      setClaimMsg({ type: 'error', text: err.message });
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <DashboardNavbar title="Clinic Partner Portal" onMenuToggle={() => {}} />
        <div className="flex justify-center py-24">
          <svg className="animate-spin h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <DashboardNavbar title="Clinic Partner Portal" onMenuToggle={() => {}} />
      <main className="px-4 py-8 max-w-7xl mx-auto space-y-6">

        {/* ──── Metric Cards ──── */}
        <PresentationTooltip title="Clinic Performance Metrics" description="Today's patient count, total revenue, pending claims, and network ratings — all computed in real-time from Supabase." position="bottom" className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Patients</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.todayPatients}</p>
              </div>
            </div>
            <p className="text-[10px] text-blue-500 font-bold">Invoices generated today</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-emerald-700">{fmt(metrics.totalRevenue)}</p>
              </div>
            </div>
            <p className="text-[10px] text-emerald-500 font-bold">All-time earnings</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Claims</p>
                <p className="text-2xl font-bold text-amber-700">{metrics.pendingClaims}</p>
              </div>
            </div>
            <p className="text-[10px] text-amber-500 font-bold">Awaiting TPA review</p>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-5 rounded-2xl shadow-sm text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-teal-100 uppercase tracking-wider">Avg Clinic Rating</p>
                <p className="text-2xl font-bold">{metrics.avgRating} ★</p>
              </div>
            </div>
            <p className="text-[10px] text-teal-100 font-bold">Network average</p>
          </div>
        </div>
        </PresentationTooltip>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ──── Patient Billing Table ──── */}
          <PresentationTooltip title="Live Billing Records" description="Patient invoices are fetched directly from the clinic_invoices table, joined with users for patient names — a live view of all billing history." position="bottom" className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Patient Billing History
              </h2>
              <span className="text-[10px] bg-teal-50 text-teal-600 font-bold px-2 py-0.5 rounded-full">{invoices.length} invoices</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/70">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patient</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Treatment</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No invoices generated yet.</td></tr>
                  ) : invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-bold text-gray-800">{inv.users?.name || '—'}</p>
                        <p className="text-[10px] text-gray-400">{inv.users?.email}</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-600 font-medium">{inv.treatment}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">{inv.description || '—'}</td>
                      <td className="px-5 py-3 text-sm font-bold text-gray-800">{fmt(inv.amount)}</td>
                      <td className="px-5 py-3 text-[10px] text-gray-400 font-medium">{new Date(inv.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </PresentationTooltip>

          {/* ──── Forms Column ──── */}
          <div className="space-y-6">

            {/* Generate Invoice Form */}
            <PresentationTooltip title="Invoice Processing" description="When an invoice is generated, it simultaneously debits the patient's health wallet, creates a wallet transaction record, and stores the treatment record — all in one atomic operation." position="left">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Generate Invoice</h2>
              </div>
              <form onSubmit={handleCreateInvoice} className="p-5 space-y-3">
                {formMsg.text && (
                  <div className={`p-3 rounded-xl text-sm font-medium ${formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {formMsg.text}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Patient Email *</label>
                  <input required type="email" value={patientEmail} onChange={e => setPatientEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all" placeholder="patient@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Treatment *</label>
                  <input required type="text" value={treatment} onChange={e => setTreatment(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all" placeholder="e.g. Dental X-Ray" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all" placeholder="Details..." rows={2} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Amount (₹) *</label>
                  <input required type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all" placeholder="500" />
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-teal-500/20">
                  {isSubmitting ? 'Processing...' : 'Generate & Process Payment'}
                </button>
              </form>
            </div>
            </PresentationTooltip>

            {/* Submit Insurance Claim */}
            <PresentationTooltip title="TPA Claim Submission" description="Clinics submit insurance claims directly to the TPA through Supabase. Claims appear instantly in the HR Dashboard for approval." position="left">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Submit Insurance Claim</h2>
              </div>
              <form onSubmit={handleClaimSubmit} className="p-5 space-y-3">
                {claimMsg.text && (
                  <div className={`p-3 rounded-xl text-sm font-medium ${claimMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {claimMsg.text}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Patient Email *</label>
                  <input required type="email" value={claimPatientEmail} onChange={e => setClaimPatientEmail(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all" placeholder="patient@company.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Hospital</label>
                  <input type="text" value={claimHospital} onChange={e => setClaimHospital(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all" placeholder={user?.name || 'Clinic name'} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Treatment *</label>
                  <input required type="text" value={claimTreatment} onChange={e => setClaimTreatment(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all" placeholder="e.g. Surgery" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Amount (₹) *</label>
                  <input required type="number" min="1" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 transition-all" placeholder="50000" />
                </div>
                <button disabled={isClaimSubmitting} type="submit" className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-amber-500/20">
                  {isClaimSubmitting ? 'Submitting...' : 'Submit Claim to TPA'}
                </button>
              </form>
            </div>
            </PresentationTooltip>

          </div>
        </div>

      </main>
    </div>
  );
}
