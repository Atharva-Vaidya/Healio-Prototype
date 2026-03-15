import { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { reportService } from '../services/reportService';

export default function HealthReportExport() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    await reportService.generateHealthReport(user.id, user.name);
    setDownloading(false);
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 rounded-xl hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-all cursor-pointer"
    >
      {downloading ? (
        <svg className="animate-spin w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      )}
      {downloading ? 'Compiling Report...' : 'Download Health Report'}
    </button>
  );
}
