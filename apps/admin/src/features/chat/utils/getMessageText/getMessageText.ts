export type MessageLike = {
  id: string;
  role: string;
  parts?: Array<Record<string, unknown>>;
  content?: string;
};

/**
 * Extracts the visible text content from an AI SDK UIMessage.
 * Prioritizes text parts, falls back to legacy `content` field.
 */
export const getMessageText = (message: MessageLike): string => {
  const textFromParts = (message.parts ?? [])
    .filter(
      (p): p is { type: 'text'; text: string } =>
        p.type === 'text' && typeof p.text === 'string',
    )
    .map((p) => p.text)
    .join('');

  if (textFromParts) return textFromParts;
  return typeof message.content === 'string' ? message.content : '';
};

/**
 * For assistant messages with no text parts, extracts fallback text
 * from tool output parts or reasoning parts.
 */
export const getAssistantFallbackText = (message: MessageLike): string => {
  for (const part of message.parts ?? []) {
    const isToolPart =
      part.type === 'dynamic-tool' ||
      (typeof part.type === 'string' &&
        (part.type as string).startsWith('tool-'));

    if (!isToolPart) continue;

    if (
      part.state === 'output-error' &&
      typeof part.errorText === 'string'
    ) {
      return `Tool error: ${part.errorText}`;
    }

    if (part.state === 'output-available') {
      if (typeof part.output === 'string') return part.output;
      if (part.output != null) {
        try {
          return JSON.stringify(part.output, null, 2);
        } catch {
          return 'Tool returned output, but it could not be rendered.';
        }
      }
    }
  }

  const reasoning = (message.parts ?? []).find(
    (p) =>
      p.type === 'reasoning' &&
      typeof p.text === 'string' &&
      (p.text as string).length > 0,
  );
  if (reasoning && typeof reasoning.text === 'string') {
    return reasoning.text;
  }

  return '';
};
