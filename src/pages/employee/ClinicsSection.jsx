import { useState, useEffect } from 'react';
import { clinicService } from '../../services/clinicService';

function StarRating({ rating, reviews }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating} ({reviews})</span>
    </div>
  );
}

export default function ClinicsSection() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      setLoading(true);
      const data = await clinicService.getVerifiedClinics();
      setClinics(data);
    } catch (err) {
      console.error('Failed to load clinics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">Verified Clinics Nearby</h2>
          <p className="text-xs text-gray-400 mt-0.5">Network hospitals and clinics in your area</p>
        </div>
        <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer">
          View All →
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
             <div className="col-span-2 py-8 text-center text-sm text-gray-500">
               <svg className="animate-spin w-5 h-5 mx-auto text-teal-500 mb-2" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Loading clinics...
             </div>
          ) : clinics.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-sm text-gray-500">
              No verified clinics found nearby.
            </div>
          ) : (
            clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="border border-gray-100 rounded-xl p-4 hover:border-teal-200 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{clinic.name}</h3>
                      <p className="text-xs text-gray-400">{clinic.speciality || 'General Medicine'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wider text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded uppercase border border-emerald-200">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Verified
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                      Cashless
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {clinic.location}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>{clinic.distance || 'Nearby'}</span>
                </div>

                <StarRating rating={clinic.rating} reviews={clinic.reviews || Math.floor(Math.random() * 500 + 50)} />

                <button className="mt-3 w-full py-2 rounded-lg bg-gray-50 text-xs font-semibold text-gray-600 hover:bg-teal-50 hover:text-teal-700 transition-all cursor-pointer border border-gray-100 hover:border-teal-200">
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
