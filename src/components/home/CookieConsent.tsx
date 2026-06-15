'use client';

import { Button } from '@/components/ui/Button';
import { AppIcon } from '@/components/ui/AppIcon';

type CookieConsentProps = {
  onAccept: () => void;
};

export function CookieConsent({ onAccept }: CookieConsentProps) {
  return (
    <div className="cookie-consent fixed inset-x-3 bottom-24 z-50 mx-auto max-w-2xl overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#07101f]/92 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:bottom-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-sky-400 to-teal-300" />
      <div className="pointer-events-none absolute left-[-4rem] top-[-4rem] h-36 w-36 rounded-full bg-cyan-300/[0.15] blur-3xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-cyan-100 shadow-inner">
            <AppIcon name="cookie" className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm font-bold text-white">Cookie preferences</p>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
              Versatile uses essential cookies for sign-in sessions, remember-me
              login, and local interface preferences. No advertising tracking is
              used in this local demo.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {['Secure session', 'Preferences', 'Local demo'].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.045] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-100/90"
                >
                  <AppIcon
                    name={item === 'Secure session' ? 'shield' : item === 'Preferences' ? 'edit' : 'cookie'}
                    className="h-3 w-3"
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={onAccept}
          className="shrink-0 rounded-full px-5 py-3"
        >
          Accept cookies
        </Button>
      </div>
    </div>
  );
}
