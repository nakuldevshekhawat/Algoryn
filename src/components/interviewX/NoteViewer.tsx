import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface NoteViewerProps {
  url: string;
}

const getThemeCSS = (theme: string) => {
  if (theme === 'light') {
    return `
      body { background-color: #ffffff !important; color: #0f172a !important; }
      h1 { color: #4f46e5 !important; border-bottom-color: #e2e8f0 !important; }
      h2 { color: #db2777 !important; }
      h3 { color: #d97706 !important; }
      .section { background-color: #f8fafc !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important; }
      .badge, .tags span { background-color: #e2e8f0 !important; color: #334155 !important; }
      pre { background-color: #f1f5f9 !important; border: 1px solid #e2e8f0 !important; color: #0f172a !important; }
      code { color: inherit !important; }
      a { color: #4f46e5 !important; }
      /* Tables */
      table { border-collapse: collapse; width: 100%; margin: 15px 0; }
      th, td { border: 1px solid #e2e8f0 !important; padding: 10px; }
      th { background-color: #f1f5f9 !important; }
    `;
  } else {
    return `
      body { background-color: #0f1015 !important; color: #f8fafc !important; }
      h1 { color: #818cf8 !important; border-bottom-color: #334155 !important; }
      h2 { color: #f472b6 !important; }
      h3 { color: #fbbf24 !important; }
      .section { background-color: #1a1b26 !important; border: 1px solid #27272a !important; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important; }
      .badge, .tags span { background-color: #1e293b !important; color: #e2e8f0 !important; }
      pre { background-color: #000000 !important; border: 1px solid #27272a !important; color: #f8fafc !important; }
      code { color: inherit !important; }
      a { color: #818cf8 !important; }
      /* Tables */
      table { border-collapse: collapse; width: 100%; margin: 15px 0; }
      th, td { border: 1px solid #27272a !important; padding: 10px; }
      th { background-color: #1e293b !important; }
    `;
  }
};

export function NoteViewer({ url }: NoteViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();

  const injectTheme = () => {
    try {
      const iframeDoc = iframeRef.current?.contentDocument;
      if (!iframeDoc) return;
      
      let styleEl = iframeDoc.getElementById('algoryn-theme-style');
      if (!styleEl) {
        styleEl = iframeDoc.createElement('style');
        styleEl.id = 'algoryn-theme-style';
        iframeDoc.head.appendChild(styleEl);
      }
      
      styleEl.textContent = getThemeCSS(theme);
    } catch (e) {
      console.warn("Could not inject theme CSS into iframe", e);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    injectTheme();
  };

  useEffect(() => {
    if (!isLoading) {
      injectTheme();
    }
  }, [theme, isLoading]);

  return (
    <div className="relative w-full h-full flex flex-col bg-white dark:bg-theme-bg overflow-hidden flex-1 rounded-[16px] xl:rounded-none">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-theme-bg z-10">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={url}
        onLoad={handleLoad}
        className="w-full h-full flex-1 border-0"
        sandbox="allow-same-origin allow-scripts"
        title="Note Viewer"
      />
    </div>
  );
}
