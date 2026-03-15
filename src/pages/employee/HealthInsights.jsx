import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { analyticsService } from '../../services/analyticsService';

export default function HealthInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadInsights();
    }
  }, [user]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getEmployeeInsights(user.id);
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-6 flex justify-center">
        <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          Health Insights
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Automated analytics based on your medical profile</p>
      </div>

      <div className="p-6">
        {insights.preventiveRecommendation && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-5 flex items-start gap-4 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-rose-900">Preventive Care Alert</p>
              <p className="text-xs text-rose-700 mt-1">{insights.preventiveRecommendation}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1">Yearly Medical Spend</p>
            <p className="text-lg font-bold text-indigo-700">{formatCurrency(insights.yearlySpend)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1">Most Visited Provider</p>
            <p className="text-sm font-bold text-gray-800 line-clamp-1 truncate" title={insights.mostVisitedProvider}>{insights.mostVisitedProvider}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1">Consultations</p>
            <p className="text-lg font-bold text-gray-800">{insights.consultationsCount}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1">Diagnostics & Tests</p>
            <p className="text-lg font-bold text-gray-800">{insights.diagnosticsCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
