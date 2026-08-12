import { useState, type ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
}

/** Lightweight tooltip for icons and shortcut hints. */
export function Tooltip({ children, content, position = "top", delayMs = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    const id = setTimeout(() => setIsVisible(true), delayMs);
    setTimeoutId(id);
  };

  const hide = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && (
        <div 
          className={`
            absolute z-[100] px-2 py-1 bg-bg-elevated text-text-primary text-[11px] font-medium
            rounded border border-border-default whitespace-nowrap shadow-lg
            animate-fade-in pointer-events-none
            ${positionClasses[position]}
          `}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
