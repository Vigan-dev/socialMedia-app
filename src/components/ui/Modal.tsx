import React from 'react';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};

export function Modal({ children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-md rounded-[2rem] border border-white/[0.08] bg-[#020617]/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-sm text-slate-400 transition hover:text-slate-100">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
