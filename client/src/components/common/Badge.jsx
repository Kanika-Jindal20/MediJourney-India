import React from 'react';

export const Badge = ({ children, variant = 'teal', className = '' }) => {
  const variants = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200/70',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/70',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/70',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/70',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/70',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.teal} ${className}`}
    >
      {children}
    </span>
  );
};

export const AccreditationBadge = ({ name }) => {
  let color = 'teal';
  if (name.includes('JCI')) color = 'amber';
  if (name.includes('NABH')) color = 'blue';
  if (name.includes('NABL')) color = 'emerald';
  if (name.includes('ISO')) color = 'purple';

  return <Badge variant={color}>{name}</Badge>;
};
