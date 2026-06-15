'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { apiArray, apiPostData } from '@/lib/apiClient';
import {
  clearLegacySupportSession,
  clearSupportSession,
  getSupportSessionStorageKey,
  readSupportSession,
  writeSupportSession,
} from '@/lib/supportSessionStorage';
import {
  decodeChatSession,
  decodeSupportChatResponse,
  decodeSupportHistoryItem,
  type ChatSession,
  type SupportHistoryItem,
} from '@/lib/apiSchemas';

type ChatMessage = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
};

const quickPrompts = [
  'I cannot log in to my account',
  'How do I report a post?',
  'My messages are not loading',
];

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  sender: 'assistant',
  text: 'Hi, I am your AI support agent. Tell me what is happening and I will help you troubleshoot it.',
};

type SupportSectionProps = {
  userId: string | null;
};

export function SupportSection({ userId }: SupportSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const supportEndpoint = useMemo(() => '/ai/support-chat', []);
  const storageKey = useMemo(() => getSupportSessionStorageKey(userId), [userId]);

  useEffect(() => {
    clearLegacySupportSession(localStorage);
  }, []);

  useEffect(() => {
    async function loadSessions() {
      if (!userId) {
        setSessions([]);
        return;
      }

      try {
        const data = await apiArray<ChatSession>(
          supportEndpoint,
          decodeChatSession,
          undefined,
          'Support sessions failed to load',
        );

        setSessions(data);
      } catch (error) {
        console.error(error);
      }
    }

    void loadSessions();
  }, [supportEndpoint, userId]);

  useEffect(() => {
    if (!storageKey) {
      setSessionId(null);
      setMessages([welcomeMessage]);
      return;
    }

    const storedSessionId = readSupportSession(localStorage, userId);

    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      setSessionId(null);
      setMessages([welcomeMessage]);
    }
  }, [storageKey, userId]);

  useEffect(() => {
    if (!storageKey) return;

    if (sessionId) {
      writeSupportSession(localStorage, userId, sessionId);
    } else {
      clearSupportSession(localStorage, userId);
    }
  }, [sessionId, storageKey, userId]);

  useEffect(() => {
    async function loadMessages() {
      if (!sessionId || !userId) return;

      try {
        const history = await apiArray<SupportHistoryItem>(
          `${supportEndpoint}/${sessionId}`,
          decodeSupportHistoryItem,
          undefined,
          'Support history failed to load',
        );

        const restoredMessages: ChatMessage[] = [welcomeMessage];

        history.forEach((entry) => {
          restoredMessages.push({
            id: `${entry._id}-user`,
            sender: 'user',
            text: entry.userMessage,
          });

          restoredMessages.push({
            id: `${entry._id}-assistant`,
            sender: 'assistant',
            text: entry.assistantMessage,
          });
        });

        setMessages(restoredMessages);
      } catch (error) {
        console.error(error);
      }
    }

    void loadMessages();
  }, [sessionId, supportEndpoint, userId]);

  async function openSession(selectedSessionId: string) {
    setSessionId(selectedSessionId);

    const history = await apiArray<SupportHistoryItem>(
      `${supportEndpoint}/${selectedSessionId}`,
      decodeSupportHistoryItem,
      undefined,
      'Support history failed to load',
    );

    const restoredMessages: ChatMessage[] = [];

    history.forEach((entry) => {
      restoredMessages.push({
        id: `${entry._id}-user`,
        sender: 'user',
        text: entry.userMessage,
      });

      restoredMessages.push({
        id: `${entry._id}-assistant`,
        sender: 'assistant',
        text: entry.assistantMessage,
      });
    });

    setMessages(restoredMessages);
  }

  async function sendMessage(nextMessage = input) {
    const trimmedMessage = nextMessage.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    if (!userId) {
      setError('Sign in before using AI support.');
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const data = await apiPostData(
        supportEndpoint,
        {
          message: trimmedMessage,
          sessionId,
        },
        'Support chat request failed',
        decodeSupportChatResponse,
      );

      setSessionId(data.sessionId);
      writeSupportSession(localStorage, userId, data.sessionId);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: data.reply,
        },
      ]);
    } catch {
      setError('Could not reach the AI support agent. Make sure NestJS and Ollama are running.');
      setMessages((currentMessages) => currentMessages.filter((message) => message.id !== userMessage.id));
      setInput(trimmedMessage);
    } finally {
      setIsSending(false);
    }
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function startNewChat() {
    clearSupportSession(localStorage, userId);
    setSessionId(null);
    setMessages([welcomeMessage]);
    setInput('');
    setError('');
  }

  return (
    <section className="flex h-[calc(100vh-65px)] flex-col bg-[#060911]">
      <div className="border-b border-white/[0.05] px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Versatile Support </p>
            <h2 className="mt-1 text-lg font-semibold text-white">AI Support Chat Agent</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={startNewChat}
              className="rounded-lg px-3 py-2 text-xs"
            >
              New Chat
            </Button>
          </div>
        </div>
        {sessions.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {sessions.map((session) => (
              <button
                key={session._id}
                type="button"
                onClick={() => void openSession(session._id)}
                className={`max-w-48 shrink-0 truncate rounded-lg border px-3 py-2 text-left text-xs transition ${
                  sessionId === session._id
                    ? 'border-indigo-400 bg-indigo-500/[0.15] text-indigo-100'
                    : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-indigo-400/50 hover:text-white'
                }`}
              >
                {session.firstMessage || 'Support chat'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[82%] rounded-xl px-4 py-3 text-sm leading-6 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'border border-white/[0.06] bg-slate-900 text-slate-200'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="support-thinking rounded-2xl border border-cyan-300/10 bg-slate-900 px-4 py-3 text-sm text-slate-400 shadow-[0_16px_42px_rgba(8,47,73,0.18)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-300/[0.12] text-xs font-black text-cyan-100">
                    AI
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                      Support agent
                    </p>
                    <div className="mt-1 flex items-end gap-1.5 text-sm text-slate-300">
                      <span>Thinking</span>
                      <span className="thinking-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                      <span className="sr-only">...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/[0.05] p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendMessage(prompt)}
              disabled={isSending}
              className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-indigo-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}

        <form onSubmit={submitMessage} className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask the support agent..."
            className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#051223] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-500"
          />
          <Button type="submit" disabled={!input.trim() || isSending} className="rounded-xl px-5">
            Send
          </Button>
        </form>
      </div>
    </section>
  );
}
