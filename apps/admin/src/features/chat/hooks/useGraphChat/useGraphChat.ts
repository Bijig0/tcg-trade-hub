import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useCallback, useMemo } from 'react';
import type { MessageLike } from '../../utils/getMessageText/getMessageText';

type UseGraphChatReturn = {
  messages: MessageLike[];
  sendMessage: (params: { text: string }) => void;
  status: string;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
};

/**
 * Wraps the Vercel AI SDK useChat hook with graph-specific configuration.
 * Points to the /api/chat endpoint and provides friendly error messages.
 */
export const useGraphChat = (): UseGraphChatReturn => {
  const [error, setError] = useState<string | null>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat' }),
    [],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (err: Error) => {
      console.error('[GraphChat] onError:', err.message);
      if (err.message?.includes('429')) {
        setError('Rate limit exceeded. Please wait a moment before trying again.');
      } else if (
        err.message?.includes('NetworkError') ||
        err.message?.includes('fetch')
      ) {
        setError('Network error. Check that the server is running.');
      } else if (err.message?.includes('ANTHROPIC_API_KEY')) {
        setError('API key not configured. Set ANTHROPIC_API_KEY in the server environment.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    },
  });

  const clearError = useCallback(() => setError(null), []);

  const isLoading = status === 'streaming' || status === 'submitted';

  return {
    messages: messages as unknown as MessageLike[],
    sendMessage,
    status,
    isLoading,
    error,
    clearError,
  };
};
