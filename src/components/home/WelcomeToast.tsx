'use client';

import { Button } from '@/components/ui/Button';

type WelcomeToastProps = {
  onDismiss: () => void;
  username: string;
};

export function WelcomeToast({ onDismiss, username }: WelcomeToastProps) {
  return (
    <div
      role="status"
      className="welcome-toast fixed right-3 top-4 z-50 w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#07101f]/92 p-4 shadow-[0_26px_80px_rgba(8,47,73,0.38)] backdrop-blur-2xl md:right-6 md:top-6"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-teal-300" />
      <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />

      <div className="relative flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-300 text-base font-black text-slate-950 shadow-[0_14px_36px_rgba(45,212,191,0.22)]">
          V
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">
            Welcome back{username ? `, ${username}` : ''}.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Your session is active. Feed, messages, and notifications are ready.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Signed in
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={onDismiss}
              className="ml-auto h-8 rounded-full px-3 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
