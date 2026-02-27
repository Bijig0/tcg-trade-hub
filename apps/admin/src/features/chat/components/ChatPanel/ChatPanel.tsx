import { useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Loader2 } from 'lucide-react';
import { useGraphChat } from '../../hooks/useGraphChat/useGraphChat';
import ChatMessage from '../ChatMessage/ChatMessage';
import ChatInput from '../ChatInput/ChatInput';
import SuggestedQuestions from '../SuggestedQuestions/SuggestedQuestions';

type ChatPanelProps = {
  isOpen: boolean;
  onToggle: () => void;
};

const PANEL_WIDTH = 384;

const ChatPanel = ({ isOpen, onToggle }: ChatPanelProps) => {
  const { messages, sendMessage, isLoading, error, clearError } =
    useGraphChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(
    (text: string) => {
      clearError();
      sendMessage({ text });
    },
    [sendMessage, clearError],
  );

  // Floating action button when closed
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Open graph assistant"
        title="Open Graph Assistant"
      >
        <MessageSquare size={20} />
      </button>
    );
  }

  return (
    <div
      className="flex h-full flex-col border-l border-border bg-card"
      style={{ width: PANEL_WIDTH, minWidth: PANEL_WIDTH }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Graph Assistant
          </h3>
        </div>
        <button
          onClick={onToggle}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close chat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-2 rounded p-0.5 transition-colors hover:bg-destructive/20"
            aria-label="Dismiss error"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Messages / Empty state */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ask questions about your graph structure, paths, registry
                entries, and data flow.
              </p>
            </div>
            <SuggestedQuestions onSelect={handleSend} />
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-secondary px-3 py-2">
                  <Loader2
                    size={14}
                    className="animate-spin text-muted-foreground"
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatPanel;
