import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-400 text-white shadow-[0_12px_30px_rgba(14,165,233,0.24)] hover:brightness-110',
  secondary:
    'border border-white/[0.12] bg-white/[0.055] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-cyan-300/30 hover:bg-white/[0.09]',
  ghost:
    'text-slate-400 hover:bg-white/[0.07] hover:text-slate-100',
  danger:
    'border border-rose-500/25 bg-rose-500/[0.07] text-rose-300 hover:border-rose-400/40 hover:bg-rose-500/[0.14]',
};

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 active:scale-[0.98] active:opacity-85 disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
