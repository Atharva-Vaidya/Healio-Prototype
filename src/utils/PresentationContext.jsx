import { createContext, useContext, useState } from 'react';

const PresentationContext = createContext(null);

export function PresentationProvider({ children }) {
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  return (
    <PresentationContext.Provider value={{ isPresentationMode, setIsPresentationMode }}>
      {children}
    </PresentationContext.Provider>
  );
}

export function usePresentation() {
  const context = useContext(PresentationContext);
  if (!context) throw new Error("Must be used within PresentationProvider");
  return context;
}
