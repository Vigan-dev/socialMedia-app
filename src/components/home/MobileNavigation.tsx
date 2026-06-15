'use client';

type MobileNavigationProps = {
  activeTab: string;
  isMoreOpen: boolean;
  messagesUnreadCount: number;
  notificationsUnreadCount: number;
  onMoreToggle: () => void;
  onSelectTab: (tab: string) => void;
  primaryTabs: string[];
  secondaryTabs: string[];
};

export function MobileNavigation({
  activeTab,
  isMoreOpen,
  messagesUnreadCount,
  notificationsUnreadCount,
  onMoreToggle,
  onSelectTab,
  primaryTabs,
  secondaryTabs,
}: MobileNavigationProps) {
  return (
    <>
      {isMoreOpen && (
        <div className="mobile-more-menu glass-panel fixed inset-x-3 bottom-20 z-40 rounded-2xl p-2 backdrop-blur-xl md:hidden">
          <div
            className={`grid gap-1 ${
              secondaryTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
            }`}
          >
            {secondaryTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onSelectTab(tab)}
                className={`min-w-0 rounded-xl px-1 py-3 text-center text-[10px] font-semibold transition sm:text-xs ${
                  activeTab === tab
                    ? 'bg-white text-slate-950'
                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <span className="block truncate">{tab}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-[#060911]/82 px-2 pb-3 pt-2 shadow-[0_-14px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden">
        <div className="glass-panel mx-auto grid max-w-md grid-cols-4 gap-1 rounded-2xl p-1">
          {[...primaryTabs, 'More'].map((tab) => {
            const isMoreTab = tab === 'More';
            const isActive = isMoreTab
              ? secondaryTabs.includes(activeTab) || isMoreOpen
              : activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  if (isMoreTab) {
                    onMoreToggle();
                    return;
                  }
                  onSelectTab(tab);
                }}
                className={`mobile-nav-item relative rounded-xl px-0.5 py-2 text-[9px] font-semibold transition sm:text-[10px] ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-lg'
                    : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-200'
                }`}
              >
                <span className="block truncate">{tab}</span>
                {tab === 'Notifications' && notificationsUnreadCount > 0 && (
                  <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                )}
                {tab === 'Messages' && messagesUnreadCount > 0 && (
                  <span className="absolute right-2 top-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
