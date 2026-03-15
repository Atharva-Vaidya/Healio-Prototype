import { useState, useEffect } from 'react';
import { activityService } from '../services/activityService';

export default function ActivityFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const data = await activityService.getCompanyActivityFeed();
      setFeed(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr) => {
    const minDiff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (minDiff < 60) return `${minDiff}m ago`;
    const hrDiff = Math.floor(minDiff / 60);
    if (hrDiff < 24) return `${hrDiff}h ago`;
    return `${Math.floor(hrDiff / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          System Activity Feed
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">Live events across the Healio platform</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : feed.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">No recent activity detected.</p>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {feed.map((item, idx) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${item.type === 'transaction' ? 'bg-teal-100 text-teal-600' :
                    item.type === 'claim' ? 'bg-amber-100 text-amber-600' :
                      'bg-indigo-100 text-indigo-600'
                  }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    {item.type === 'transaction' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {item.type === 'claim' && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                    {item.type === 'invoice' && <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />}
                  </svg>
                </div>

                {/* Event Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-50 border border-gray-100 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-gray-900 text-sm">{item.user}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100">{getTimeAgo(item.date)}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{item.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
