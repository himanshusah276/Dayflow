import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  icon: Icon,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm font-bold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base font-bold rounded-2xl gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm hover:shadow transition-all duration-150',
    secondary: 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 text-white shadow-sm hover:shadow transition-all duration-150',
    outline: 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:bg-slate-100 text-slate-700 dark:text-slate-200 shadow-subtle transition-all duration-150',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 transition-all duration-150',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm transition-all duration-150',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all duration-150',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-sans select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0 text-current" />
      ) : null}
      {children}
    </button>
  );
}
