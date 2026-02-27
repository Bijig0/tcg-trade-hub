import { Send, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect, type FormEvent } from 'react';

type ChatInputProps = {
  onSend: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
};

const ChatInput = ({
  onSend,
  isLoading,
  placeholder = 'Ask about the graph...',
}: ChatInputProps) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    onSend(trimmed);
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="rounded-lg bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        aria-label="Send message"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
      </button>
    </form>
  );
};

export default ChatInput;
