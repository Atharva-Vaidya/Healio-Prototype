import { useState, useEffect, useRef } from 'react';
import { searchService } from '../services/searchService';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const data = await searchService.globalSearch(query);
        setResults(data);
        setIsSearching(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xs md:max-w-sm">
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 w-full focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(query.length >= 2) setIsOpen(true) }}
          placeholder="Global Search..."
          className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder:text-gray-400"
        />
        {isSearching && (
          <svg className="animate-spin w-3 h-3 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map((categoryGroup, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <h4 className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50 rounded-t-lg">
                  {categoryGroup.category}
                </h4>
                <div className="mt-1">
                  {categoryGroup.items.map(item => (
                    <div key={item.id} className="px-3 py-2 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors group">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && !isSearching && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[100] p-4 text-center">
          <p className="text-sm text-gray-500">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
