import React from 'react';

export function TextInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-white/[0.08] bg-[#051223] px-4 py-3 text-sm text-slate-100 outline-none transition duration-200 placeholder:text-slate-500 focus:border-indigo-500 ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full resize-none bg-transparent text-sm font-medium text-slate-200 outline-none placeholder:text-slate-600 ${className}`}
      {...props}
    />
  );
}
