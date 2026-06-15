'use client';

import React from 'react';
import type { TrendingItemData } from '@/types/feed';

interface ExploreSectionProps {
  trendingItems: TrendingItemData[];
  onTrendClick: (topic: string) => void;
}

export function ExploreSection({
  trendingItems,
  onTrendClick,
}: ExploreSectionProps) {
  return (
    <section className="min-w-0">
      <div className="border-b border-white/[0.08] bg-[#070e1f] px-5 py-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Explore
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Follow what your network is talking about.
          </h2>

          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Topics are built from live posts, so the list stays aligned with
            real activity instead of static placeholders.
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/[0.04] px-5">
        {trendingItems.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-slate-400">No trends yet</p>
            <p className="mt-1 text-xs text-slate-600">
              Create posts to populate live topics.
            </p>
          </div>
        ) : (
          trendingItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="group block w-full min-w-0 py-4 text-left"
              onClick={() => onTrendClick(item.topic)}
            >
              <p className="truncate text-[10px] font-bold uppercase text-slate-600">
                {item.category}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-200 transition group-hover:text-indigo-400">
                {item.topic}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.count}</p>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
