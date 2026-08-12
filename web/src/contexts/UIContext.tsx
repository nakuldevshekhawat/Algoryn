import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface UIContextType {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  isFocusMode: boolean;
  isCommandPaletteOpen: boolean;
  
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  
  toggleFocusMode: () => void;
  setFocusMode: (value: boolean) => void;
  
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (value: boolean) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  // Sidebar State (Persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Focus Mode
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Command Palette
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Actions
  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev: boolean) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => setIsMobileSidebarOpen(p => !p), []);
  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);

  const toggleFocusMode = useCallback(() => setIsFocusMode(p => !p), []);
  
  const toggleCommandPalette = useCallback(() => setCommandPaletteOpen(p => !p), []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K (Command Palette)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
      
      // Cmd/Ctrl + B (Toggle Sidebar)
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      
      // Shift + F (Focus Mode)
      // Make sure we aren't in an input field so we don't accidentally trigger it while typing capital F.
      if (e.shiftKey && e.key.toLowerCase() === "f") {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          toggleFocusMode();
        }
      }
      
      // Escape
      if (e.key === "Escape") {
        if (isCommandPaletteOpen) {
          setCommandPaletteOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette, toggleSidebar, toggleFocusMode, isCommandPaletteOpen]);

  return (
    <UIContext.Provider
      value={{
        isSidebarCollapsed,
        isMobileSidebarOpen,
        isFocusMode,
        isCommandPaletteOpen,
        
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
        
        toggleFocusMode,
        setFocusMode: setIsFocusMode,
        
        toggleCommandPalette,
        setCommandPaletteOpen,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return ctx;
}
