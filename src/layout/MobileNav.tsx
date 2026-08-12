import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';
import { globalItems, dsaItems, dsItems } from '../navigation/nav';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  const location = useLocation();
  const { activeMode } = useMode();

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
              onClick={onClose}
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

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-theme-text/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      <div 
        className="fixed inset-y-0 left-0 w-[280px] bg-theme-sidebar shadow-soft z-50 transform transition-transform duration-300 lg:hidden flex flex-col"
        style={{ animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/50">
          <span className="text-[14px] font-bold text-theme-text uppercase tracking-widest">Navigation</span>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white text-theme-muted hover:text-theme-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 py-6">
          {renderNavGroup('GLOBAL', globalItems)}
          {renderNavGroup(activeMode === 'dsa' ? 'DSA PREPARATION' : 'DATA SCIENCE', currentNavItems)}
        </nav>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};
