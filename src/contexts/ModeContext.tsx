import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type Mode = 'dsa' | 'data-science' | 'interviewX';

interface ModeContextType {
  activeMode: Mode;
  setMode: (mode: Mode) => void;
  isFocusMode: boolean;
  setIsFocusMode: (focus: boolean) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('learning_mode');
    return (saved === 'dsa' || saved === 'data-science' || saved === 'interviewX') ? saved as Mode : 'data-science';
  });

  const navigate = useNavigate();

  const setMode = (mode: Mode) => {
    if (activeMode === mode) return; // Do nothing if clicking the currently active mode

    setActiveMode(mode);
    localStorage.setItem('learning_mode', mode);

    navigate('/');
  };

  useEffect(() => {
    localStorage.setItem('learning_mode', activeMode);
  }, [activeMode]);

  return (
    <ModeContext.Provider value={{ activeMode, setMode, isFocusMode, setIsFocusMode }}>
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
