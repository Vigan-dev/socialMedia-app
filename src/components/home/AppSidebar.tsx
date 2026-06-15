'use client';

import { useState } from 'react';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/Button';
import type { useAuth, UserStatus } from '@/hooks/useAuth';

type AuthState = ReturnType<typeof useAuth>;

type AppSidebarProps = {
  activeTab: string;
  auth: AuthState;
  messagesUnreadCount: number;
  notificationsUnreadCount: number;
  onSelectTab: (tab: string) => void;
  tabs: string[];
  themeAccentIndicator: string;
};

const statusStyles: Record<UserStatus, string> = {
  available: 'bg-emerald-400',
  away: 'bg-amber-400',
  busy: 'bg-rose-400',
};

const statusOptions: Array<{
  description: string;
  glow: string;
  label: string;
  value: UserStatus;
}> = [
  {
    description: 'Open to chats and replies.',
    glow: 'shadow-[0_0_14px_rgba(52,211,153,0.7)]',
    label: 'Available',
    value: 'available',
  },
  {
    description: 'Slow replies for now.',
    glow: 'shadow-[0_0_14px_rgba(251,191,36,0.7)]',
    label: 'Away',
    value: 'away',
  },
  {
    description: 'Focused, do not disturb.',
    glow: 'shadow-[0_0_14px_rgba(251,113,133,0.7)]',
    label: 'Busy',
    value: 'busy',
  },
];

export function AppSidebar({
  activeTab,
  auth,
  messagesUnreadCount,
  notificationsUnreadCount,
  onSelectTab,
  tabs,
  themeAccentIndicator,
}: AppSidebarProps) {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const currentStatus = auth.profile?.status ?? 'available';
  const currentStatusOption =
    statusOptions.find((option) => option.value === currentStatus) ??
    statusOptions[0];

  const selectTab = (tab: string) => {
    setIsStatusMenuOpen(false);
    onSelectTab(tab);
  };

  return (
    <aside className="sticky top-0 hidden h-screen min-w-0 flex-col justify-between border-r border-white/[0.05] py-8 pr-4 md:flex">
      <div className="flex flex-col gap-10">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-lg font-black text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            V
          </div>

          <span className="hidden bg-gradient-to-r from-white to-slate-400 bg-clip-text text-xl font-bold tracking-tight text-transparent md:block">
            versatile
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => selectTab(tab)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-300 ease-out ${
                  isActive
                    ? 'border border-white/[0.08] bg-white/[0.08] font-semibold text-slate-100 shadow-lg'
                    : 'text-slate-400 hover:bg-white/[0.08] hover:text-slate-100'
                }`}
              >
                {isActive && (
                  <span
                    className={`absolute left-0 top-1/4 h-1/2 w-0.5 rounded-r ${themeAccentIndicator}`}
                  />
                )}

                <span className="min-w-0 truncate text-left">{tab}</span>
                {tab === 'Notifications' && notificationsUnreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {notificationsUnreadCount}
                  </span>
                )}
                {tab === 'Messages' && messagesUnreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {messagesUnreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {auth.isLoggedIn ? (
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-2.5 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
          <button
            type="button"
            onClick={() => selectTab('Profile')}
            className="flex w-full items-center gap-3 rounded-xl p-1 text-left transition hover:bg-white/[0.05]"
          >
            <UserAvatar avatarUrl={auth.avatarUrl} username={auth.username} />

            <div className="hidden overflow-hidden md:block">
              <p className="truncate text-xs font-semibold text-slate-200">
                {auth.username}
              </p>

              <p className="flex items-center gap-1.5 truncate text-[10px] font-medium text-slate-500">
                <span
                  className={`h-2 w-2 rounded-full ${statusStyles[currentStatus]} ${currentStatusOption.glow}`}
                />
                <span className="truncate">{currentStatusOption.label}</span>
              </p>
            </div>
          </button>

          <div className="relative mt-2 hidden md:block">
            <button
              type="button"
              onClick={() => setIsStatusMenuOpen((current) => !current)}
              className="group flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-[#0c111d]/80 px-3 py-2 text-left text-[11px] font-semibold text-slate-200 outline-none transition hover:border-indigo-400/50 hover:bg-[#11182a] focus:border-indigo-400"
              aria-expanded={isStatusMenuOpen}
              aria-haspopup="menu"
              aria-label="Set presence status"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${statusStyles[currentStatus]} ${currentStatusOption.glow}`}
                />
                <span className="min-w-0 truncate">
                  {currentStatusOption.label}
                </span>
              </span>

              <span
                className={`text-slate-500 transition ${
                  isStatusMenuOpen ? 'rotate-180 text-slate-200' : ''
                }`}
              >
                v
              </span>
            </button>

            {isStatusMenuOpen && (
              <div
                role="menu"
                className="status-menu absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-2xl border border-white/[0.1] bg-[#081120]/95 p-1.5 shadow-2xl backdrop-blur-xl"
              >
                {statusOptions.map((option) => {
                  const isCurrent = option.value === currentStatus;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsStatusMenuOpen(false);
                        void auth.updateStatus(option.value).catch(() => undefined);
                      }}
                      className={`group flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition ${
                        isCurrent
                          ? 'bg-white text-slate-950'
                          : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusStyles[option.value]} ${option.glow}`}
                      />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-bold">
                          {option.label}
                        </span>
                        <span
                          className={`mt-0.5 block text-[10px] leading-4 ${
                            isCurrent ? 'text-slate-600' : 'text-slate-500'
                          }`}
                        >
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <Button
          onClick={() => auth.openAuth('login')}
          variant="secondary"
          className="w-full text-xs"
        >
          Sign In
        </Button>
      )}
    </aside>
  );
}
