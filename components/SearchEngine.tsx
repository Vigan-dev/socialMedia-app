'use client';

import React from 'react';
import { TrendingItemData } from '@/types/feed';

interface SearchEngineProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  trendingItems: TrendingItemData[];
  onTrendClick: (topic: string) => void;
}

export function SearchEngine({ 
  searchQuery, 
  onSearchChange, 
  trendingItems,
  onTrendClick 
}: SearchEngineProps) {
  return (
    <aside className="hidden lg:block w-80 h-screen sticky top-0 pl-8 py-8 space-y-6">
      {/* Input Target */}
      <div className="relative">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search versatile threads..." 
          className="w-full bg-[#0c111d]/40 border border-white/[0.06] rounded-lg py-2 px-4 outline-none text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500/40 focus:bg-[#0c111d]/80 transition duration-200"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 text-[10px] text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Trending Box Layout */}
      <div className="border border-white/[0.06] rounded-xl bg-[#0c111d]/20 p-4 space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
          Trending Insights
        </h3>
        <div className="space-y-3 divide-y divide-white/[0.03]">
          {trendingItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onTrendClick(item.topic)}
              className="group cursor-pointer pt-3 first:pt-0 block rounded-md transition"
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                {item.category}
              </p>
              <p className="font-semibold text-slate-300 group-hover:text-indigo-400 text-sm transition mt-0.5">
                {item.topic}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}