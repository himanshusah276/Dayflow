import React from 'react';

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
    info: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/20',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20',
    
    // Status-specific aliases
    Present: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    Late: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
    'Half-day': 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20',
    Absent: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
    'On Leave': 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20',
    
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
    
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    Terminated: 'bg-slate-100 text-slate-500 border-slate-200',
    
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    Processing: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
  };

  const selectedVariant = variantClasses[variant] || variantClasses.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${selectedVariant} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
}
