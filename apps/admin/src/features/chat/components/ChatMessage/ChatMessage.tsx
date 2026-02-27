import { simpleMarkdown } from '../../utils/simpleMarkdown/simpleMarkdown';
import {
  getMessageText,
  getAssistantFallbackText,
  type MessageLike,
} from '../../utils/getMessageText/getMessageText';

type ChatMessageProps = {
  message: MessageLike;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const text = getMessageText(message);
  const displayText =
    text || (message.role === 'assistant' ? getAssistantFallbackText(message) : '');

  if (!displayText) return null;

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary/15 text-foreground'
            : 'bg-secondary text-foreground'
        }`}
        dangerouslySetInnerHTML={
          !isUser ? { __html: simpleMarkdown(displayText) } : undefined
        }
      >
        {isUser ? displayText : undefined}
      </div>
    </div>
  );
};

export default ChatMessage;
