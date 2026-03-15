import { usePresentation } from '../utils/PresentationContext';

export default function PresentationTooltip({ title, description, children, position = 'bottom', className = '' }) {
  const { isPresentationMode } = usePresentation();

  if (!isPresentationMode) return <>{children}</>;

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3'
  };

  return (
    <div className={`relative group/tooltip inline-block ${className}`}>
      <div className="ring-4 ring-amber-400/50 rounded-xl transition-all h-full w-full">
        {children}
      </div>
      
      <div className={`absolute ${positions[position]} w-64 p-3 bg-gray-900 bg-opacity-95 text-white rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-[100] pointer-events-none`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">{title}</p>
        </div>
        <p className="text-xs font-medium leading-snug">{description}</p>
        
        {/* Triangle arrow */}
        <div className={`absolute w-3 h-3 bg-gray-900 rotate-45 ${
          position === 'top' ? 'bottom-[-6px] left-[calc(50%-6px)]' :
          position === 'bottom' ? 'top-[-6px] left-[calc(50%-6px)]' :
          position === 'right' ? 'left-[-6px] top-[calc(50%-6px)]' :
          'right-[-6px] top-[calc(50%-6px)]'
        }`}></div>
      </div>
    </div>
  );
}
