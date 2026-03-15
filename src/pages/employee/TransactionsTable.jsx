import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { walletService } from '../../services/walletService';
import { clinicService } from '../../services/clinicService';
import { fraudDetectionService } from '../../services/fraudDetectionService';
import FraudIndicator from '../../components/FraudIndicator';

export default function TransactionsTable({ refreshKey = 0 }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [verifiedClinics, setVerifiedClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [user, refreshKey]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const [txData, clinicData] = await Promise.all([
        walletService.getWalletTransactions(user.id),
        clinicService.getVerifiedClinics()
      ]);
      
      // Calculate fraud risk in parallel for all transactions
      const txWithRisk = await Promise.all(
        txData.map(async (tx) => {
          const riskLevel = await fraudDetectionService.calculateFraudRisk(tx.provider);
          return { ...tx, riskLevel };
        })
      );
      
      setTransactions(txWithRisk);
      setVerifiedClinics(clinicData.map(c => c.name));
    } catch (err) {
      console.error('Failed to load transactions or clinics', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">Recent Wallet Transactions</h2>
          <p className="text-xs text-gray-400 mt-0.5">Your latest health wallet activity</p>
        </div>
        <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer">
          View All →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/70">
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Provider</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                  <svg className="animate-spin w-5 h-5 mx-auto text-teal-500 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(tx.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        tx.type === 'credit'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {tx.provider.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                          {tx.provider}
                          {verifiedClinics.includes(tx.provider) && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded uppercase border border-emerald-200">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Verified Provider
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {tx.description || 'Service'}
                      {tx.bill_file_url && (
                        <a href={tx.bill_file_url} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:text-teal-700" title="View Bill">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm3.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 w-fit">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                        Completed
                      </span>
                      {tx.riskLevel && (
                        <FraudIndicator riskLevel={tx.riskLevel} />
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right whitespace-nowrap ${
                    tx.type === 'credit' ? 'text-emerald-600' : 'text-gray-800'
                  }`}>
                    {tx.type === 'credit' ? '+' : '−'}{formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
