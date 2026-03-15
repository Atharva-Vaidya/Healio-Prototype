import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';

export default function HRAnalyticsCharts() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getHRAnalyticsCharts();
      setChartData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short', style: 'currency', currency: 'INR' }).format(val);

  if (loading || !chartData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 flex justify-center shadow-sm">
        <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  // Calculate percentages for categories
  const totalCategorySpend = chartData.categorySpending.reduce((acc, cat) => acc + cat.value, 0);

  // Find max monthly spend for bar chart scaling
  const maxMonthlySpend = Math.max(...chartData.monthlySpending.map(m => m.spend)) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Monthly Spending Trend (Bar Chart CSS) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-6">Monthly Healthcare Spending</h3>
        <div className="h-48 flex items-end justify-between gap-2">
          {chartData.monthlySpending.map((item, idx) => {
            const heightPercent = Math.max((item.spend / maxMonthlySpend) * 100, 2); // min 2% height for visibility
            return (
              <div key={idx} className="flex flex-col items-center flex-1 group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-indigo-600 mb-2">
                  {formatCurrency(item.spend)}
                </div>
                <div 
                  className="w-full max-w-[40px] bg-indigo-100 group-hover:bg-indigo-500 rounded-t-lg transition-all duration-500 relative"
                  style={{ height: `${heightPercent}%` }}
                ></div>
                <div className="mt-3 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase">
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Medical Categories (Progress Bars) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-6">Top Medical Categories</h3>
        <div className="space-y-5">
          {chartData.categorySpending.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No category data available.</p>
          ) : (
            chartData.categorySpending.map((cat, idx) => {
              const percentage = ((cat.value / totalCategorySpend) * 100).toFixed(0);
              const colorClass = idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-teal-400' : idx === 2 ? 'bg-pink-400' : 'bg-amber-400';
              
              return (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-sm font-semibold text-gray-700">{cat.category}</span>
                    <span className="text-xs font-bold text-gray-900">{formatCurrency(cat.value)} <span className="text-gray-400 font-medium">({percentage}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${colorClass} h-2 rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
