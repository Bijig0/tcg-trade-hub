import { describe, it, expect } from 'vitest';
import formatMessage from './formatMessage';

describe('formatMessage', () => {
  it('returns the body for text messages', () => {
    expect(formatMessage({ type: 'text', body: 'Hello!' })).toBe('Hello!');
  });

  it('truncates text messages longer than 100 characters', () => {
    const longBody = 'a'.repeat(150);
    const result = formatMessage({ type: 'text', body: longBody });
    expect(result).toBe(`${'a'.repeat(100)}...`);
    expect(result.length).toBe(103); // 100 chars + '...'
  });

  it('does not truncate text messages at exactly 100 characters', () => {
    const body = 'b'.repeat(100);
    const result = formatMessage({ type: 'text', body: body });
    expect(result).toBe(body);
    expect(result.length).toBe(100);
  });

  it('returns empty string for text with null body', () => {
    expect(formatMessage({ type: 'text', body: null })).toBe('');
  });

  it('returns "Sent a photo" for image messages', () => {
    expect(formatMessage({ type: 'image', body: null })).toBe('Sent a photo');
  });

  it('returns "Sent a trade offer" for card_offer messages', () => {
    expect(formatMessage({ type: 'card_offer', body: null })).toBe(
      'Sent a trade offer',
    );
  });

  it('returns "Responded to a trade offer" for card_offer_response messages', () => {
    expect(formatMessage({ type: 'card_offer_response', body: null })).toBe(
      'Responded to a trade offer',
    );
  });

  it('returns "Proposed a meetup" for meetup_proposal messages', () => {
    expect(formatMessage({ type: 'meetup_proposal', body: null })).toBe(
      'Proposed a meetup',
    );
  });

  it('returns "Responded to a meetup proposal" for meetup_response messages', () => {
    expect(formatMessage({ type: 'meetup_response', body: null })).toBe(
      'Responded to a meetup proposal',
    );
  });

  it('returns body for system messages when body is present', () => {
    expect(formatMessage({ type: 'system', body: 'Trade completed!' })).toBe(
      'Trade completed!',
    );
  });

  it('returns "System notification" for system messages with null body', () => {
    expect(formatMessage({ type: 'system', body: null })).toBe(
      'System notification',
    );
  });
});
