import { describe, it, expect } from 'vitest';
import { getMessageText, getAssistantFallbackText } from './getMessageText';
import type { MessageLike } from './getMessageText';

describe('getMessageText', () => {
  it('should extract text from parts', () => {
    const message: MessageLike = {
      id: '1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hello world' }],
    };
    expect(getMessageText(message)).toBe('Hello world');
  });

  it('should concatenate multiple text parts', () => {
    const message: MessageLike = {
      id: '2',
      role: 'assistant',
      parts: [
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'world' },
      ],
    };
    expect(getMessageText(message)).toBe('Hello world');
  });

  it('should skip non-text parts', () => {
    const message: MessageLike = {
      id: '3',
      role: 'assistant',
      parts: [
        { type: 'tool-call', toolCallId: 'abc' },
        { type: 'text', text: 'After tool' },
      ],
    };
    expect(getMessageText(message)).toBe('After tool');
  });

  it('should fall back to content field', () => {
    const message: MessageLike = {
      id: '4',
      role: 'user',
      content: 'Legacy content',
    };
    expect(getMessageText(message)).toBe('Legacy content');
  });

  it('should return empty string for no text', () => {
    const message: MessageLike = {
      id: '5',
      role: 'assistant',
      parts: [{ type: 'tool-call', toolCallId: 'abc' }],
    };
    expect(getMessageText(message)).toBe('');
  });
});

describe('getAssistantFallbackText', () => {
  it('should extract tool error text', () => {
    const message: MessageLike = {
      id: '1',
      role: 'assistant',
      parts: [
        {
          type: 'tool-call',
          state: 'output-error',
          errorText: 'Connection failed',
        },
      ],
    };
    expect(getAssistantFallbackText(message)).toBe(
      'Tool error: Connection failed',
    );
  });

  it('should extract tool output string', () => {
    const message: MessageLike = {
      id: '2',
      role: 'assistant',
      parts: [
        {
          type: 'tool-result',
          state: 'output-available',
          output: 'Tool result text',
        },
      ],
    };
    expect(getAssistantFallbackText(message)).toBe('Tool result text');
  });

  it('should JSON-stringify object output', () => {
    const message: MessageLike = {
      id: '3',
      role: 'assistant',
      parts: [
        {
          type: 'dynamic-tool',
          state: 'output-available',
          output: { key: 'value' },
        },
      ],
    };
    const result = getAssistantFallbackText(message);
    expect(result).toContain('"key": "value"');
  });

  it('should extract reasoning text as last resort', () => {
    const message: MessageLike = {
      id: '4',
      role: 'assistant',
      parts: [{ type: 'reasoning', text: 'Thinking about this...' }],
    };
    expect(getAssistantFallbackText(message)).toBe('Thinking about this...');
  });

  it('should return empty string when no fallback available', () => {
    const message: MessageLike = {
      id: '5',
      role: 'assistant',
      parts: [],
    };
    expect(getAssistantFallbackText(message)).toBe('');
  });
});
