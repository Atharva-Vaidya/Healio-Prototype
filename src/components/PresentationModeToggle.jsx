import { usePresentation } from '../utils/PresentationContext';

export default function PresentationModeToggle() {
  const { isPresentationMode, setIsPresentationMode } = usePresentation();

  return (
    <button
      onClick={() => setIsPresentationMode(!isPresentationMode)}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all cursor-pointer border ${
        isPresentationMode 
          ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600' 
          : 'bg-white text-gray-500 border-gray-200 hover:text-gray-800 hover:bg-gray-50 hover:shadow-xl'
      }`}
      title="Toggle Presentation Mode"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
      <span className="text-sm font-bold hidden md:block">
        {isPresentationMode ? 'Demo Active' : 'Enable Demo Mode'}
      </span>
    </button>
  );
}
