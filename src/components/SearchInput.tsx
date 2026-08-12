import { useState, useEffect, useCallback, useRef } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/** Search input with debounce, clear button, and global keyboard shortcut. */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search problems...",
  debounceMs = 300,
  className = "",
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) {
        onChange(local);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [local, debounceMs, onChange, value]);

  const handleClear = useCallback(() => {
    setLocal("");
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  // Global hotkey to focus this input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`relative group ${className}`}>
      <MagnifyingGlassIcon 
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200
          ${isFocused ? "text-brand-primary" : "text-text-muted group-hover:text-text-secondary"}`} 
      />
      <input
        ref={inputRef}
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-12 py-2.5 text-sm
          bg-bg-card border border-border-default rounded-xl
          text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary
          transition-all duration-200 shadow-sm
        "
        aria-label="Search"
      />
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {local && (
          <button
            onClick={handleClear}
            className="p-1 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-md transition-colors"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        )}
        {!local && (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-text-muted bg-bg-elevated rounded border border-border-default">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
