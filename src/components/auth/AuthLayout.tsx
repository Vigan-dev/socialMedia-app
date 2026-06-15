import { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <div className="app-shell relative flex min-h-screen overflow-hidden bg-[#060911] text-white">
      <div className="absolute left-[-8rem] top-[-6rem] h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-[-8rem] right-[-6rem] h-96 w-96 rounded-full bg-teal-400/[0.15] blur-3xl" />
      <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative hidden flex-col justify-center px-20 lg:flex lg:w-1/2">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-teal-400 font-black shadow-[0_16px_42px_rgba(14,165,233,0.28)]">
            V
          </div>

          <h1 className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-3xl font-black tracking-tight text-transparent">
            Versatile
          </h1>
        </div>

        <h2 className="max-w-lg text-6xl font-black leading-[0.95] tracking-[-0.06em]">
          Connect. Share. Discover.
        </h2>

        <p className="mt-6 max-w-md text-lg leading-8 text-slate-400">
          The modern social hub for conversations, communities,
          and ideas.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="glass-panel rounded-2xl p-4">
            <p className="text-2xl font-bold">10K+</p>
            <p className="text-sm text-slate-400">Conversations</p>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <p className="text-2xl font-bold">5K+</p>
            <p className="text-sm text-slate-400">Members</p>
          </div>

          <div className="glass-panel rounded-2xl p-4">
            <p className="text-2xl font-bold">50K+</p>
            <p className="text-sm text-slate-400">Posts</p>
          </div>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="glass-panel w-full max-w-md rounded-[2rem] p-8 backdrop-blur-xl">
          <h2 className="text-3xl font-black tracking-[-0.04em]">{title}</h2>

          <p className="mt-2 leading-7 text-slate-400">
            {description}
          </p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
