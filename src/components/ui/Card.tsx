import React from 'react';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      className={`glass-panel rounded-2xl transition duration-200 hover:border-cyan-300/20 hover:shadow-[0_24px_80px_rgba(8,47,73,0.24)] ${className}`}
      {...props}
    />
  );
}
