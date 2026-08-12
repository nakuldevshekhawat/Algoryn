import { Link, useLocation } from 'react-router-dom';
import { Home, Search, BarChart2, Calendar, Map, List, Repeat, Star, FileText, BarChart, Video } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';

export const Sidebar = () => {
  const location = useLocation();
  const { activeMode, setMode } = useMode();

  const globalItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/progress', label: 'Progress', icon: BarChart2 }
  ];
  
  const dsaItems = [
    { path: '/dsa/roadmap', label: 'Roadmap', icon: Map },
    { path: '/dsa/problems', label: 'Problems', icon: List },
    { path: '/dsa/revision', label: 'Revision', icon: Repeat },
    { path: '/dsa/favorites', label: 'Favorites', icon: Star },
    { path: '/dsa/notes', label: 'Notes', icon: FileText },
    { path: '/dsa/statistics', label: 'Statistics', icon: BarChart }
  ];

  const dsItems = [
    { path: '/data-science/lectures', label: 'Lectures', icon: Video }
  ];

  const currentNavItems = activeMode === 'dsa' ? dsaItems : dsItems;

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
                ${isActive ? 'bg-theme-text text-theme-sidebar' : 'bg-theme-card text-theme-text group-hover:bg-pastel-lavender-dark group-hover:text-theme-text'}
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
    <aside className="w-[260px] xl:w-[280px] flex-shrink-0 hidden lg:flex flex-col h-[calc(100vh-32px)] bg-theme-sidebar rounded-[32px] sticky top-4 shadow-softer border border-white/50">
      <div className="flex items-center gap-4 pt-8 pb-8 px-8">
        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-white/50">
          <img src="/assets/algoryn-icon.png" alt="Algoryn Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-theme-text leading-tight text-[22px]">Algoryn</h1>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="px-5 mb-8">
        <div className="bg-theme-card border border-white rounded-[20px] p-1 shadow-sm flex items-center">
          <button
            onClick={() => setMode('dsa')}
            className={`flex-1 text-center py-2.5 rounded-[16px] text-[13px] font-bold transition-all ${activeMode === 'dsa' ? 'bg-pastel-lavender text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            DSA
          </button>
          <button
            onClick={() => setMode('data-science')}
            className={`flex-1 text-center py-2.5 rounded-[16px] text-[13px] font-bold transition-all ${activeMode === 'data-science' ? 'bg-pastel-mint text-theme-text shadow-sm' : 'text-theme-muted hover:text-theme-text'}`}
          >
            Data Science
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-2">
        {renderNavGroup('GLOBAL', globalItems)}
        {renderNavGroup(activeMode === 'dsa' ? 'DSA PREPARATION' : 'DATA SCIENCE', currentNavItems)}
      </nav>
      
      <div className="pb-8 px-5 mt-auto pt-4">
        <div className="bg-theme-card border border-white rounded-[24px] p-5 shadow-softer flex flex-col items-center text-center">
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
