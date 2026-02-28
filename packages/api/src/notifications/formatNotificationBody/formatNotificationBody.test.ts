import { describe, it, expect } from 'vitest';
import formatNotificationBody from './formatNotificationBody';

describe('formatNotificationBody', () => {
  const SENDER = 'Alice';

  it('formats text message with body', () => {
    const result = formatNotificationBody(SENDER, 'text', 'Hey, want to trade?');
    expect(result).toEqual({ title: 'Alice', body: 'Hey, want to trade?' });
  });

  it('formats text message with null body fallback', () => {
    const result = formatNotificationBody(SENDER, 'text', null);
    expect(result).toEqual({ title: 'Alice', body: 'Sent a message' });
  });

  it('formats image message', () => {
    const result = formatNotificationBody(SENDER, 'image', null);
    expect(result).toEqual({ title: 'Alice', body: 'Sent an image' });
  });

  it('formats card_offer message', () => {
    const result = formatNotificationBody(SENDER, 'card_offer', null);
    expect(result).toEqual({
      title: 'Alice - Trade Offer',
      body: 'Sent you a card trade offer',
    });
  });

  it('formats card_offer_response message', () => {
    const result = formatNotificationBody(SENDER, 'card_offer_response', null);
    expect(result).toEqual({
      title: 'Alice - Trade Response',
      body: 'Responded to your trade offer',
    });
  });

  it('formats meetup_proposal message', () => {
    const result = formatNotificationBody(SENDER, 'meetup_proposal', null);
    expect(result).toEqual({
      title: 'Alice - Meetup Proposal',
      body: 'Proposed a meetup location and time',
    });
  });

  it('formats meetup_response message', () => {
    const result = formatNotificationBody(SENDER, 'meetup_response', null);
    expect(result).toEqual({
      title: 'Alice - Meetup Response',
      body: 'Responded to your meetup proposal',
    });
  });

  it('formats system message with body', () => {
    const result = formatNotificationBody(SENDER, 'system', 'Maintenance at midnight');
    expect(result).toEqual({
      title: 'TCG Trade Hub',
      body: 'Maintenance at midnight',
    });
  });

  it('formats system message with null body fallback', () => {
    const result = formatNotificationBody(SENDER, 'system', null);
    expect(result).toEqual({
      title: 'TCG Trade Hub',
      body: 'New system notification',
    });
  });

  it('formats unknown message type with body', () => {
    const result = formatNotificationBody(SENDER, 'unknown_type', 'Some content');
    expect(result).toEqual({ title: 'Alice', body: 'Some content' });
  });

  it('formats unknown message type with null body fallback', () => {
    const result = formatNotificationBody(SENDER, 'future_type', null);
    expect(result).toEqual({ title: 'Alice', body: 'New message' });
  });
});
