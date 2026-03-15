import { useState, useEffect } from 'react';
import { clinicService } from '../services/clinicService';
import DashboardNavbar from './employee/DashboardNavbar';

export default function ProviderMap() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const data = await clinicService.getVerifiedClinics();
      setClinics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <DashboardNavbar title="Healio Provider Network" onMenuToggle={() => {}} />
      <main className="px-4 py-8 max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Verified Providers Directory</h2>
              <p className="text-sm text-gray-500 mt-0.5">Find 100% cashless, verified trusted clinics near you</p>
            </div>
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 bg-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {clinics.length} Network Locations
              </span>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
            ) : clinics.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-12">No verified clinics found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clinics.map(clinic => (
                  <div key={clinic.id} className="border border-gray-100 rounded-xl p-5 hover:border-teal-300 hover:shadow-md transition-all group relative overflow-hidden bg-white">
                    {/* Map Mock Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=pune&zoom=13&size=200x200&sensor=false')] bg-cover opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full pointer-events-none grayscale blur-[1px]"></div>
                    
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl shadow-inner border border-teal-100 border-b-2">
                        {clinic.name.charAt(0)}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded uppercase border border-emerald-200">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Verified
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          {clinic.rating}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-bold text-gray-800 mb-1 relative z-10">{clinic.name}</h3>
                    <p className="text-xs font-medium text-gray-500 mb-4 flex items-start gap-1.5 relative z-10">
                      <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {clinic.location}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex gap-2 relative z-10">
                      <button className="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-teal-200 shadow-sm border-b-2">
                        Book Appointment
                      </button>
                      <button className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-500 text-xs font-bold rounded-lg border border-gray-200 transition-colors shadow-sm cursor-pointer" title="Get Directions">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12.453 3.438C11.972 3.86 11 4.58 11 5.4v5.48c0 .874-.954 1.34-1.616.76l-4.524-3.958a1.125 1.125 0 00-1.72.96v7.356c0 .8.938 1.251 1.571.742l4.583-3.666c.642-.513 1.646-.056 1.646.772v5.48c0 .822.972 1.54 1.453 1.962L16.2 14.5a1.125 1.125 0 00.3-1.464l-4.047-9.598zm0 0l-4.047-9.598A1.125 1.125 0 008.106 1.376l-4.524 3.958a1.125 1.125 0 001.72.96z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
