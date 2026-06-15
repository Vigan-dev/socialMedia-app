'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type HomeHeroProps = {
  isLoggedIn: boolean;
  openAuth: (mode: 'login' | 'signup') => void;
};

const heroCards = [
  [
    'Build closer connections',
    'Share progress, ask for feedback, and keep important conversations visible.',
  ],
  [
    'Keep your community informed',
    'Use a readable feed to make announcements, post ideas, and react.',
  ],
  [
    'Explore what matters',
    'Find trending topics, discover connections, and join conversations.',
  ],
  [
    'Start with real stories',
    'Every post is a window into work updates, design ideas, or team progress.',
  ],
];

export function HomeHero({ isLoggedIn, openAuth }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28rem),linear-gradient(180deg,rgba(7,14,31,0.92),rgba(7,14,31,0.64))] px-5 py-9">
      <div className="pointer-events-none absolute right-[-5rem] top-[-5rem] h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="max-w-3xl space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300/75">
            Versatile social hub
          </p>

          <h2 className="max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl">
            Connect faster, share clearly, and keep every conversation in one
            place.
          </h2>

          <p className="max-w-2xl text-base leading-8 text-slate-400">
            Versatile brings your network together with a clean feed, quick
            posts, threaded messages, and trend discovery.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {heroCards.map(([title, copy]) => (
            <Card key={title} className="p-5">
              <p className="font-semibold text-slate-100">{title}</p>

              <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
            </Card>
          ))}
        </div>

        {!isLoggedIn && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => openAuth('signup')}
              className="rounded-full px-5 py-3"
            >
              Create an account
            </Button>

            <Button
              onClick={() => openAuth('login')}
              variant="secondary"
              className="rounded-full px-5 py-3"
            >
              Sign in to continue
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
