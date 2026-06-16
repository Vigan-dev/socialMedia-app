'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiJsonData, apiPatchData, apiPostData } from '@/lib/apiClient';
import {
  decodeMessageItem,
  decodeMessageItems,
  decodeMessageThread,
  decodeMessageThreads,
} from '@/lib/apiSchemas';
import { MessageItem, MessageThread } from '@/components/sections/MessagesSection';

export function useChat(isLoggedIn: boolean) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => setError(''), []);

  const showError = useCallback((fallback: string, error?: unknown) => {
    setError(error instanceof Error ? error.message : fallback);
  }, []);

  const loadThreads = useCallback(async () => {
    if (!isLoggedIn) return;

    const data = await apiJsonData<MessageThread[]>(
      '/conversations',
      'Failed to load conversations',
      decodeMessageThreads,
    );

    setThreads(data);
    if (!activeThreadId && data[0]) {
      setActiveThreadId(data[0].id);
    }
    clearError();
  }, [activeThreadId, clearError, isLoggedIn]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (!conversationId) return;

      const data = await apiJsonData<MessageItem[]>(
        `/conversations/${conversationId}/messages`,
        'Failed to load messages',
        decodeMessageItems,
      );

      setMessages(data);

      try {
        const readData = await apiPatchData(
          `/conversations/${conversationId}/read`,
          undefined,
          'Failed to mark conversation read',
          decodeMessageThread,
        );
        setThreads((current) =>
          current.map((thread) =>
            thread.id === conversationId ? readData : thread,
          ),
        );
      } catch {
        // Loading messages should not fail just because read receipts failed.
      }
      clearError();
    },
    [clearError],
  );

  const startConversation = useCallback(
    async (participantId: string) => {
      try {
        clearError();
        const data = await apiPostData(
          '/conversations',
          {
            participantId,
          },
          'Failed to start conversation',
          decodeMessageThread,
        );

        setThreads((current) => {
          const exists = current.some((thread) => thread.id === data.id);
          return exists
            ? current.map((thread) => (thread.id === data.id ? data : thread))
            : [data, ...current];
        });
        setActiveThreadId(data.id);
        await loadMessages(data.id);
        return data.id;
      } catch (error) {
        showError('Could not start that conversation. Please try again.', error);
        throw error;
      }
    },
    [clearError, loadMessages, showError],
  );

  const updateTyping = useCallback(
    async (conversationId: string, isTyping: boolean) => {
      if (!conversationId || !isLoggedIn) return;

      const data = await apiPatchData(
        `/conversations/${conversationId}/typing`,
        {
          isTyping,
        },
        'Failed to update typing status',
        decodeMessageThread,
      );

      setThreads((current) =>
        current.map((thread) =>
          thread.id === conversationId ? data : thread,
        ),
      );
    },
    [isLoggedIn],
  );

  const sendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !activeThreadId) return;
    clearError();

    const optimisticMessage: MessageItem = {
      delivered: false,
      id: `pending-${crypto.randomUUID()}`,
      isOwn: true,
      read: false,
      sender: { avatarUrl: null, id: 'me', name: 'You' },
      text,
      time: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticMessage]);
    setChatInput('');
    void updateTyping(activeThreadId, false).catch(() => undefined);

    try {
      const data = await apiPostData(
        `/conversations/${activeThreadId}/messages`,
        {
          body: text,
        },
        'Failed to send message',
        decodeMessageItem,
      );

      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticMessage.id ? data : message,
        ),
      );
      await loadThreads();
    } catch (error) {
      setMessages((current) =>
        current.filter((message) => message.id !== optimisticMessage.id),
      );
      setChatInput(text);
      showError('Message was not sent. Please try again.', error);
    }
  }, [activeThreadId, chatInput, clearError, loadThreads, showError, updateTyping]);

  useEffect(() => {
    if (!activeThreadId || !isLoggedIn) return;

    const isTyping = Boolean(chatInput.trim());
    const timeout = window.setTimeout(() => {
      updateTyping(activeThreadId, isTyping).catch(() => undefined);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [activeThreadId, chatInput, isLoggedIn, updateTyping]);

  useEffect(() => {
    if (!isLoggedIn) {
      setThreads([]);
      setMessages([]);
      setActiveThreadId('');
      setConversationSearch('');
      clearError();
      return;
    }

    setIsLoading(true);
    loadThreads()
      .catch((error) => {
        console.error('Failed loading conversations:', error);
        showError('Failed to load conversations. Please try again.', error);
      })
      .finally(() => setIsLoading(false));
  }, [clearError, isLoggedIn, loadThreads, showError]);

  useEffect(() => {
    if (!activeThreadId) return;

    loadMessages(activeThreadId).catch((error) => {
      console.error('Failed loading messages:', error);
      showError('Failed to load messages. Please try again.', error);
    });
  }, [activeThreadId, loadMessages, showError]);

  useEffect(() => {
    if (!isLoggedIn || !activeThreadId) return;

    const interval = window.setInterval(() => {
      loadThreads().catch((error) =>
        showError('Conversation refresh failed. Retrying in the background.', error),
      );
      loadMessages(activeThreadId).catch((error) =>
        showError('Message refresh failed. Retrying in the background.', error),
      );
    }, 3500);

    return () => window.clearInterval(interval);
  }, [activeThreadId, isLoggedIn, loadMessages, loadThreads, showError]);

  const filteredThreads = useMemo(() => {
    const query = conversationSearch.toLowerCase().trim();
    if (!query) return threads;

    return threads.filter((thread) =>
      [
        thread.user,
        thread.handle,
        thread.lastMessage,
        thread.participant.name,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [conversationSearch, threads]);

  const unreadCount = useMemo(
    () => threads.reduce((total, thread) => total + thread.unreadCount, 0),
    [threads],
  );

  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const typingUser = activeThread?.typingUsers?.[0] ?? '';

  return {
    activeThreadId,
    chatInput,
    clearError,
    conversationSearch,
    error,
    filteredThreads,
    isLoading,
    messages,
    sendMessage,
    setActiveThreadId,
    setChatInput,
    setConversationSearch,
    startConversation,
    threads,
    typingUser,
    unreadCount,
  };
}
