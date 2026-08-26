import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { Link, useSearchParams } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import ProblemDetail from '../pages/dsa/ProblemDetail';
import { useEffect, useState } from 'react';
import { MobileNav } from './MobileNav';
import { useMode } from '../contexts/ModeContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const Layout = ({ children }: { children: ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const problemId = searchParams.get("problemId");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeMode, setMode } = useMode();
  const { theme, toggleTheme } = useTheme();

  const closePeekPanel = () => {
    searchParams.delete("problemId");
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && problemId) {
        closePeekPanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [problemId]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full font-sans max-w-[1920px] mx-auto p-0 lg:p-4 gap-4">
      {/* Mobile Header */}
      <header className="lg:hidden flex flex-col gap-3 p-4 bg-theme-sidebar shadow-softer z-20 sticky top-0 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center overflow-hidden shadow-sm border border-theme-border bg-black">
              <img src="/assets/algoryn-icon.png" alt="Algoryn Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-theme-text text-xl">Algoryn</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-theme-card hover:bg-theme-card text-theme-text transition-colors shadow-sm"
              title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-theme-card hover:bg-theme-card text-theme-text transition-colors shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile Mode Switcher */}
        <div className="bg-theme-card border border-theme-border rounded-[20px] p-1 shadow-sm flex items-center w-full">
          <button
            onClick={() => setMode('dsa')}
            className={`flex-1 text-center py-2 rounded-[16px] text-[12px] font-bold transition-all ${activeMode === 'dsa' ? 'bg-pastel-lavender text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            DSA
          </button>
          <button
            onClick={() => setMode('data-science')}
            className={`flex-1 text-center py-2 rounded-[16px] text-[12px] font-bold transition-all px-1 ${activeMode === 'data-science' ? 'bg-pastel-mint text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            DS
          </button>
          <button
            onClick={() => setMode('interviewX')}
            className={`flex-1 text-center py-2 rounded-[16px] text-[12px] font-bold transition-all ${activeMode === 'interviewX' ? 'bg-pastel-pink text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            IntX
          </button>
        </div>
      </header>

      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full h-[calc(100vh-130px)] lg:h-[calc(100vh-32px)] overflow-y-auto overflow-x-hidden rounded-[32px] pt-6 px-4 sm:px-6 lg:px-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto pb-16">
          {children}
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />

      {/* Peek Panel Overlay */}
      {problemId && (
        <>
          <div 
            className="fixed inset-0 bg-theme-text/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={closePeekPanel}
          />
          <div 
            className="fixed inset-y-0 right-0 w-full sm:w-[600px] lg:w-[700px] xl:w-[800px] bg-theme-card border-l border-theme-border shadow-soft z-40 transform transition-transform duration-300 translate-x-0 sm:m-4 sm:rounded-[32px] sm:h-[calc(100vh-32px)]"
            style={{ animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="flex flex-col h-full rounded-[32px] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-theme-border bg-theme-sidebar/50">
                <span className="text-[13px] font-bold text-theme-muted uppercase tracking-widest">Problem Workspace</span>
                <button 
                  onClick={closePeekPanel}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-theme-card text-theme-muted hover:text-theme-text transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 bg-theme-card custom-scrollbar">
                <ProblemDetail id={problemId} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Required for the slide in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
