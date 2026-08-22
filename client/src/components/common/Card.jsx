import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-subtle ${
        hover ? 'transition-all duration-200 hover:shadow-card hover:border-slate-300 dark:hover:border-slate-700' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
