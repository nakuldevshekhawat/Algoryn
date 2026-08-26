import { Link, useLocation } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';
import { useTheme } from '../contexts/ThemeContext';
import { globalItems, dsaItems, dsItems, interviewXItems } from '../navigation/nav';
import { Sun, Moon } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const { activeMode, setMode } = useMode();
  const { theme, toggleTheme } = useTheme();

  const currentNavItems = activeMode === 'dsa' ? dsaItems : activeMode === 'data-science' ? dsItems : interviewXItems;

  const renderNavGroup = (title: string, items: any[]) => (
    <div className="px-3 mb-6">
      <h3 className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-3 pl-1">{title}</h3>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path);
            
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.path}
              className="flex items-center gap-4 px-3 py-2 group rounded-[16px] transition-all hover:bg-theme-card"
            >
              <div className={`
                w-10 h-10 rounded-[14px] flex items-center justify-center transition-all shadow-sm
                ${isActive ? 'bg-theme-text text-theme-sidebar' : 'bg-theme-card text-theme-text group-hover:bg-accent-lavender group-hover:text-theme-text'}
              `}>
                <Icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[14px] transition-colors ${isActive ? 'font-bold text-theme-text' : 'font-semibold text-theme-muted group-hover:text-theme-text'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-[260px] xl:w-[280px] flex-shrink-0 hidden lg:flex flex-col h-[calc(100vh-32px)] bg-theme-sidebar rounded-[32px] sticky top-4 shadow-softer border border-theme-border">
      <div className="flex items-center gap-3 pt-8 pb-8 px-6 xl:px-8">
        <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-theme-border">
          <img src="/assets/algoryn-icon.png" alt="Algoryn Logo" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-theme-text leading-tight text-[20px] xl:text-[22px]">Algoryn</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 xl:w-9 xl:h-9 flex items-center justify-center rounded-full bg-theme-card text-theme-text shadow-sm border border-theme-border-strong hover:bg-theme-surface-hover dark:border-theme-border/10 hover:bg-theme-surface-hover transition-colors"
          title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? <Sun className="w-[16px] h-[16px]" /> : <Moon className="w-[16px] h-[16px]" />}
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="px-5 mb-8">
        <div className="bg-theme-card border border-theme-border rounded-[20px] p-1 shadow-sm flex items-center">
          <button
            onClick={() => setMode('dsa')}
            className={`flex-1 text-center py-2 rounded-[16px] text-[12px] md:text-[13px] font-bold transition-all ${activeMode === 'dsa' ? 'bg-pastel-lavender text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            DSA
          </button>
          <button
            onClick={() => setMode('data-science')}
            className={`flex-1 text-center py-2 rounded-[16px] text-[12px] md:text-[13px] font-bold transition-all px-1 ${activeMode === 'data-science' ? 'bg-pastel-mint text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            DS
          </button>
          <button
            onClick={() => setMode('interviewX')}
            className={`flex-1 text-center py-2 rounded-[16px] text-[12px] md:text-[13px] font-bold transition-all ${activeMode === 'interviewX' ? 'bg-pastel-pink text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            IntX
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-2">
        {renderNavGroup('GLOBAL', globalItems)}
        {renderNavGroup(activeMode === 'dsa' ? 'DSA PREPARATION' : activeMode === 'data-science' ? 'DATA SCIENCE' : 'INTERVIEWX', currentNavItems)}
      </nav>
      
      <div className="pb-8 px-5 mt-auto pt-4">
        <div className="bg-theme-card border border-theme-border rounded-[24px] p-5 shadow-softer flex flex-col items-center text-center">
          <div className="w-full max-w-[140px] mb-4 flex items-center justify-center">
             <img src="/assets/algoryn-wordmark.png" alt="Algoryn Wordmark" className="w-full h-auto rounded-[12px]" />
          </div>
          <p className="text-[16px] font-bold text-theme-text leading-tight mb-0.5">Algoryn</p>
          <p className="text-[11px] font-bold text-theme-muted mb-1 mt-0.5 tracking-wider uppercase">Learning Platform</p>
        </div>
      </div>
    </aside>
  );
};
