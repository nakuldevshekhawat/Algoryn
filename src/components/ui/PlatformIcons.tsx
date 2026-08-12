
export const LeetCodeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <div className={`bg-white rounded-full p-[2px] flex items-center justify-center shrink-0 ${className}`}>
    <img src="/icons/leetcode.png" alt="LeetCode" title="LeetCode" className="w-full h-full object-contain" />
  </div>
);

export const GFGIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <img src="/icons/gfg.png" alt="GeeksforGeeks" title="GeeksforGeeks" className={`object-contain ${className}`} />
);

export const CodeStudioIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <img src="/icons/tuf.jpg" alt="CodeStudio" title="CodeStudio" className={`object-contain rounded-sm ${className}`} />
);

export const YouTubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <img src="/icons/youtube.png" alt="YouTube" title="YouTube" className={`object-contain ${className}`} />
);

export const TUFIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <img src="/icons/codestudio.png" alt="TUF" title="TakeUForward Article" className={`object-contain rounded-sm ${className}`} />
);
