import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Loader2 } from 'lucide-react';

export const Alert = ({ type = 'info', message, title, className = '' }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 icon:text-blue-500',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon:text-emerald-500',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 icon:text-amber-500',
    error: 'bg-rose-50 border-rose-200 text-rose-800 icon:text-rose-500',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles[type]} ${className}`}>
      {icons[type]}
      <div>
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div className="text-xs leading-relaxed">{message}</div>
      </div>
    </div>
  );
};

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };
  return <Loader2 className={`animate-spin text-teal-600 ${sizes[size]} ${className}`} />;
};
