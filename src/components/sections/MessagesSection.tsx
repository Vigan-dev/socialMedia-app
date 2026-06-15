'use client';

import React from 'react';
import { UserAvatar } from '@/components/UserAvatar';

export interface MessageThread {
  handle: string;
  id: string;
  lastMessage: string;
  lastMessageAt: string | null;
  participant: {
    avatarUrl: string | null;
    id: string;
    name: string;
    status: 'available' | 'away' | 'busy';
  };
  typingUsers?: string[];
  unreadCount: number;
  user: string;
}

export interface MessageItem {
  delivered: boolean;
  id: string;
  isOwn: boolean;
  read: boolean;
  sender: {
    avatarUrl: string | null;
    id: string;
    name: string;
  };
  text: string;
  time: string;
}

interface MessagesSectionProps {
  activeThreadId: string;
  chatInput: string;
  conversationSearch: string;
  filteredThreads: MessageThread[];
  isLoading: boolean;
  messages: MessageItem[];
  onSendMessage: () => void;
  setActiveThreadId: (id: string) => void;
  setChatInput: (val: string) => void;
  setConversationSearch: (val: string) => void;
  themeAccent: string;
  threads: MessageThread[];
  typingUser: string;
  unreadCount: number;
}

const statusStyles = {
  available: 'bg-emerald-400',
  away: 'bg-amber-400',
  busy: 'bg-rose-400',
};

function formatMessageTime(value: string | null) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function MessagesSection({
  activeThreadId,
  chatInput,
  conversationSearch,
  filteredThreads,
  isLoading,
  messages,
  onSendMessage,
  setActiveThreadId,
  setChatInput,
  setConversationSearch,
  themeAccent,
  threads,
  typingUser,
  unreadCount,
}: MessagesSectionProps) {
  const currentThread = threads.find((thread) => thread.id === activeThreadId);
  const messageListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;

    messageList.scrollTo({
      top: messageList.scrollHeight,
      behavior: 'smooth',
    });
  }, [activeThreadId, messages.length, typingUser]);

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl bg-white/[0.03]" />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-medium text-slate-400">No messages yet</p>
        <p className="mt-1 text-xs text-slate-600">
          Search for a profile and choose Message to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-57px)] min-h-0 min-w-0 overflow-hidden grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
      <div className="min-h-0 min-w-0 overflow-y-auto border-b border-white/[0.05] md:border-b-0 md:border-r">
        <div className="sticky top-0 z-[1] border-b border-white/[0.05] bg-[#060911]/95 p-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Conversations
            </p>

            {unreadCount > 0 && (
              <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {unreadCount} unread
              </span>
            )}
          </div>

          <input
            type="search"
            value={conversationSearch}
            onChange={(event) => setConversationSearch(event.target.value)}
            placeholder="Search conversations..."
            className="mt-3 w-full rounded-xl border border-white/[0.06] bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50"
          />
        </div>

        {filteredThreads.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            No conversations match your search.
          </div>
        ) : filteredThreads.map((thread) => (
          <button
            key={thread.id}
            type="button"
            onClick={() => setActiveThreadId(thread.id)}
            className={`flex w-full min-w-0 gap-3 p-4 text-left transition ${
              activeThreadId === thread.id
                ? 'bg-white/[0.04]'
                : 'hover:bg-white/[0.02]'
            }`}
          >
            <UserAvatar
              avatarUrl={thread.participant.avatarUrl}
              username={thread.user}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-xs font-bold text-slate-200">
                  {thread.user}
                </p>
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    statusStyles[thread.participant.status]
                  }`}
                />
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-500">
                {thread.typingUsers?.length
                  ? `${thread.typingUsers[0]} is typing...`
                  : thread.lastMessage}
              </p>
            </div>

            {thread.unreadCount > 0 && (
              <span className="rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {thread.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-slate-950/20">
        <div
          key={`thread-header-${activeThreadId}`}
          className="shrink-0 flex items-center gap-3 border-b border-white/[0.05] p-4 animate-[message-fade-up_180ms_ease-out_both]"
        >
          {currentThread && (
            <>
              <UserAvatar
                avatarUrl={currentThread.participant.avatarUrl}
                username={currentThread.user}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-100">
                  {currentThread.user}
                </p>
                <p className="text-xs text-slate-500">
                  {typingUser
                    ? `${typingUser} is typing...`
                    : currentThread.participant.status}
                </p>
              </div>
            </>
          )}
        </div>

        <div
          key={`message-list-${activeThreadId}`}
          ref={messageListRef}
          className="custom-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 animate-[message-fade-up_220ms_ease-out_both]"
        >
          {messages.map((message, index) => (
            <div
              key={message.id}
              style={{ animationDelay: `${Math.min(index, 8) * 24}ms` }}
              className={`flex flex-col ${
                message.isOwn ? 'items-end' : 'items-start'
              } animate-[message-fade-up_220ms_ease-out_both]`}
            >
              <div
                className={`max-w-[78%] break-words rounded-xl p-3 text-sm leading-6 ${
                  message.isOwn
                    ? 'bg-indigo-600 text-white'
                    : 'border border-white/[0.05] bg-slate-900 text-slate-200'
                }`}
              >
                {message.text}
              </div>
              <span className="mt-1 px-1 text-[10px] text-slate-600">
                {formatMessageTime(message.time)}
                {message.isOwn && (
                  <span className="ml-1">
                    {message.read
                      ? 'Read'
                      : message.delivered
                        ? 'Delivered'
                        : 'Sending'}
                  </span>
                )}
              </span>
            </div>
          ))}

          {typingUser && (
            <p className="text-xs text-slate-500">{typingUser} is typing...</p>
          )}
        </div>

        <div className="shrink-0 flex gap-2 border-t border-white/[0.05] p-3">
          <input
            type="text"
            value={chatInput}
            onChange={(event) => {
              setChatInput(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Write a message..."
            className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500/50"
          />
          <button
            type="button"
            onClick={onSendMessage}
            disabled={!chatInput.trim()}
            className={`rounded-lg px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${themeAccent.split(' ')[0]}`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
