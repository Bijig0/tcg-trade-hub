import { describe, it, expect } from 'vitest';
import { resolveSegments } from './routePathMap';

describe('resolveSegments', () => {
  it('resolves tab-only to step 0', () => {
    expect(resolveSegments(['(tabs)', '(discover)'])).toEqual({
      pathId: 'flow:p2p-trade',
      label: 'Discover Feed',
      stepIndex: 0,
    });
  });

  it('resolves discover/browse to step 0', () => {
    expect(resolveSegments(['(tabs)', '(discover)', 'browse'])).toEqual({
      pathId: 'flow:p2p-trade',
      label: 'Browse Listings',
      stepIndex: 0,
    });
  });

  it('resolves deep route with dynamic UUID segment', () => {
    expect(
      resolveSegments(['(tabs)', '(listings)', 'listing', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890']),
    ).toEqual({
      pathId: 'state:listing',
      label: 'Listing Detail',
      stepIndex: 1,
    });
  });

  it('resolves edit with dynamic segment', () => {
    expect(
      resolveSegments(['(tabs)', '(listings)', 'edit', '12345678-abcd-efab-cdef-123456789012']),
    ).toEqual({
      pathId: 'state:listing',
      label: 'Edit Listing',
      stepIndex: 2,
    });
  });

  it('resolves chat with conversationId', () => {
    expect(
      resolveSegments(['(tabs)', '(messages)', 'chat', 'conv-uuid-1234-5678-abcd-ef1234567890']),
    ).toEqual({
      pathId: 'state:offer',
      label: 'Chat Thread',
      stepIndex: 1,
    });
  });

  it('resolves meetup detail with dynamic id', () => {
    expect(
      resolveSegments(['(tabs)', '(meetups)', '12345678-1234-1234-1234-123456789012']),
    ).toEqual({
      pathId: 'state:meetup',
      label: 'Meetup Detail',
      stepIndex: 1,
    });
  });

  it('resolves trade-builder to p2p-trade step 1', () => {
    expect(resolveSegments(['(tabs)', '(listings)', 'trade-builder'])).toEqual({
      pathId: 'flow:p2p-trade',
      label: 'Trade Builder',
      stepIndex: 1,
    });
  });

  it('resolves messages tab to offer step 0', () => {
    expect(resolveSegments(['(tabs)', '(messages)'])).toEqual({
      pathId: 'state:offer',
      label: 'Messages',
      stepIndex: 0,
    });
  });

  it('resolves meetup-location to meetup step 1', () => {
    expect(resolveSegments(['(tabs)', '(messages)', 'meetup-location'])).toEqual({
      pathId: 'state:meetup',
      label: 'Meetup Location',
      stepIndex: 1,
    });
  });

  it('returns null for profile (unmapped)', () => {
    expect(resolveSegments(['(tabs)', '(profile)'])).toBeNull();
  });

  it('returns null for empty segments', () => {
    expect(resolveSegments([])).toBeNull();
  });

  it('returns null when only (tabs) segment', () => {
    expect(resolveSegments(['(tabs)'])).toBeNull();
  });

  it('falls back to tab when deep route not mapped', () => {
    expect(resolveSegments(['(tabs)', '(discover)', 'unknown-page'])).toEqual({
      pathId: 'flow:p2p-trade',
      label: 'Discover Feed',
      stepIndex: 0,
    });
  });

  it('resolves numeric dynamic segments', () => {
    expect(resolveSegments(['(tabs)', '(meetups)', '42'])).toEqual({
      pathId: 'state:meetup',
      label: 'Meetup Detail',
      stepIndex: 1,
    });
  });
});
