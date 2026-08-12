import type { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

/** Clean, structured data table component inspired by TUF+. */
export function Table({ children, className = "" }: TableProps) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-border-default bg-bg-card shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse min-w-[600px]">
        {children}
      </table>
    </div>
  );
}

/** Table header group. */
export function TableHeader({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-bg-elevated border-b border-border-default">
      {children}
    </thead>
  );
}

/** Table header cell. */
export function TableHead({ children, className = "", width }: { children: ReactNode; className?: string; width?: string }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap ${className}`}
      style={{ width }}
    >
      {children}
    </th>
  );
}

/** Table body group. */
export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border-subtle">{children}</tbody>;
}

interface TableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Table row with hover interactions. */
export function TableRow({ children, onClick, className = "" }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        group transition-colors
        ${onClick ? "cursor-pointer table-row-hover" : ""}
        ${className}
      `}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </tr>
  );
}

/** Table data cell. */
export function TableCell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 text-sm text-text-primary ${className}`}>
      {children}
    </td>
  );
}
