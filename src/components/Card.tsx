import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  role?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, role, noPadding }) => {
  return (
    <div 
        role={role}
        className={`
            bg-slate-900/30 backdrop-blur-3xl 
            border border-white/10 
            rounded-[1.75rem] 
            shadow-2xl shadow-black/40
            transition-all duration-500 
            hover:border-white/20 hover:bg-slate-900/40 hover:shadow-cyan-900/10
            ${noPadding ? '' : 'p-6'} 
            ${className || ''}
        `}
    >
      {children}
    </div>
  );
};

export default Card;