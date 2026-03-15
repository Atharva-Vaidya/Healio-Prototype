import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { claimsService } from '../../services/claimsService';

const statusConfig = {
  Pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  Approved: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
  },
  Settled: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  Rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-400',
  },
};

export default function ClaimsTable() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [hospital, setHospital] = useState('');
  const [treatment, setTreatment] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadClaims();
    }
  }, [user]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await claimsService.getUserClaims(user.id);
      setClaims(data);
    } catch (err) {
      console.error('Failed to load claims', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!hospital || !treatment || !amount) return;

    setIsSubmitting(true);
    try {
      await claimsService.submitClaim(user.id, hospital, treatment, parseFloat(amount));
      setIsModalOpen(false);
      setHospital('');
      setTreatment('');
      setAmount('');
      loadClaims();
    } catch (err) {
      alert('Error submitting claim: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">Insurance Claims</h2>
          <p className="text-xs text-gray-400 mt-0.5">Track and manage your insurance claims</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xs font-semibold hover:from-teal-600 hover:to-cyan-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Claim
        </button>
      </div>

      {/* Claim Submission Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Submit New Claim</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Clinic Name</label>
                <input required type="text" value={hospital} onChange={e => setHospital(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none" placeholder="e.g. Apollo Hospital" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Description</label>
                <input required type="text" value={treatment} onChange={e => setTreatment(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none" placeholder="e.g. Broken Arm Surgery" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim Amount (₹)</label>
                <input required type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none" placeholder="e.g. 15000" />
              </div>
              <div className="pt-2">
                <button disabled={isSubmitting} type="submit" className={`w-full py-2.5 rounded-xl font-semibold text-white transition-colors cursor-pointer ${isSubmitting ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'}`}>
                  {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/70">
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Claim ID</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Hospital</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Treatment</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                  <svg className="animate-spin w-5 h-5 mx-auto text-teal-500 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading claims...
                </td>
              </tr>
            ) : claims.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                  No claims found.
                </td>
              </tr>
            ) : (
              claims.map((claim) => {
                const statusName = capitalize(claim.status);
                const status = statusConfig[statusName] || statusConfig['Pending'];
                const shortId = `CLM-${claim.id.split('-')[0].toUpperCase()}`;
                
                return (
                  <tr key={claim.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-teal-700 whitespace-nowrap" title={claim.id}>{shortId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                          {claim.hospital.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{claim.hospital}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{claim.treatment}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(claim.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">{formatCurrency(claim.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.bg} ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {statusName}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
