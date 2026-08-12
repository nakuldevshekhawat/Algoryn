import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type Mode = 'dsa' | 'data-science';

interface ModeContextType {
  activeMode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [activeMode, setActiveMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('learning_mode');
    return (saved === 'dsa' || saved === 'data-science') ? saved : 'data-science';
  });

  const navigate = useNavigate();
  const location = useLocation();

  const setMode = (mode: Mode) => {
    setActiveMode(mode);
    localStorage.setItem('learning_mode', mode);

    // If currently on a course specific page, navigate to the other course home
    const isDSA = location.pathname.startsWith('/dsa');
    const isDS = location.pathname.startsWith('/data-science') || location.pathname.startsWith('/lectures');

    if (mode === 'dsa' && isDS) {
      navigate('/dsa/roadmap');
    } else if (mode === 'data-science' && isDSA) {
      navigate('/data-science/lectures');
    }
  };

  useEffect(() => {
    localStorage.setItem('learning_mode', activeMode);
  }, [activeMode]);

  return (
    <ModeContext.Provider value={{ activeMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
