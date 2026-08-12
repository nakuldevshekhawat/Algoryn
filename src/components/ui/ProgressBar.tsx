interface ProgressBarProps {
  progress: number;
  total: number;
  className?: string;
  colorClass?: string;
  showText?: boolean;
}

export const ProgressBar = ({ 
  progress, 
  total, 
  className = '', 
  colorClass = 'bg-pastel-mint-dark',
  showText = true 
}: ProgressBarProps) => {
  const percentage = total === 0 ? 0 : Math.round((progress / total) * 100);

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-theme-muted">Progress</span>
          <span className="text-sm font-bold text-theme-text">{progress} / {total}</span>
        </div>
      )}
      <div className="h-3 w-full bg-pastel-peach rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
