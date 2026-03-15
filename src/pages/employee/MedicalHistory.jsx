import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { historyService } from '../../services/historyService';
import DashboardNavbar from './DashboardNavbar';

export default function MedicalHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await historyService.getMedicalHistory(user.id);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} – ${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <DashboardNavbar title="Medical History Timeline" onMenuToggle={() => {}} />
      <main className="px-4 py-8 max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Your Healthcare Journey</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500 py-8 text-center text-sm">No medical history records found yet.</p>
          ) : (
            <div className="relative border-l-2 border-teal-100 ml-3 md:ml-4 space-y-8 pb-4">
              {history.map((item, idx) => (
                <div key={item.id} className="relative pl-6 md:pl-8 group">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-teal-50 border-2 border-teal-500 group-hover:bg-teal-500 transition-colors"></span>
                  
                  {/* Content Card */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm border border-gray-200 bg-white font-bold text-gray-600 px-2.5 py-1 rounded-md shadow-sm">
                          {formatDate(item.date)}
                        </span>
                        <span className="text-base font-bold text-gray-800">{item.provider}</span>
                      </div>
                      
                      <span className={`text-xs font-bold px-2 py-1 rounded-full w-fit ${
                        item.type === 'claim' ? 'bg-amber-100 text-amber-700' :
                        item.type === 'invoice' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 font-medium">
                        {item.service}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2 sm:mt-0">
                        <span className="text-sm font-bold text-gray-800">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
