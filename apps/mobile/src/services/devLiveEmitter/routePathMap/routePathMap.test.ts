import { describe, it, expect } from 'vitest';
import { resolveSegments } from './routePathMap';

describe('resolveSegments', () => {
  it('resolves tab-only to step 0', () => {
    expect(resolveSegments(['(tabs)', '(discover)'])).toEqual({
      label: 'Discover Feed',
      flows: [{ pathId: 'flow:p2p-trade', stepIndex: 0 }],
    });
  });

  it('resolves discover/browse to step 0', () => {
    expect(resolveSegments(['(tabs)', '(discover)', 'browse'])).toEqual({
      label: 'Browse Listings',
      flows: [{ pathId: 'flow:p2p-trade', stepIndex: 0 }],
    });
  });

  it('resolves deep route with dynamic UUID segment', () => {
    expect(
      resolveSegments(['(tabs)', '(listings)', 'listing', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890']),
    ).toEqual({
      label: 'Listing Detail',
      flows: [{ pathId: 'state:listing', stepIndex: 1 }],
    });
  });

  it('resolves edit with dynamic segment', () => {
    expect(
      resolveSegments(['(tabs)', '(listings)', 'edit', '12345678-abcd-efab-cdef-123456789012']),
    ).toEqual({
      label: 'Edit Listing',
      flows: [{ pathId: 'state:listing', stepIndex: 2 }],
    });
  });

  it('resolves chat with conversationId to multiple flows', () => {
    expect(
      resolveSegments(['(tabs)', '(messages)', 'chat', 'f47ac10b-58cc-4372-a567-0e02b2c3d479']),
    ).toEqual({
      label: 'Chat Thread',
      flows: [
        { pathId: 'state:offer', stepIndex: 1 },
        { pathId: 'flow:p2p-trade', stepIndex: 2 },
      ],
    });
  });

  it('resolves meetup detail with dynamic id', () => {
    expect(
      resolveSegments(['(tabs)', '(meetups)', '12345678-1234-1234-1234-123456789012']),
    ).toEqual({
      label: 'Meetup Detail',
      flows: [{ pathId: 'state:meetup', stepIndex: 1 }],
    });
  });

  it('resolves trade-builder to multiple flows', () => {
    expect(resolveSegments(['(tabs)', '(listings)', 'trade-builder'])).toEqual({
      label: 'Trade Builder',
      flows: [
        { pathId: 'flow:p2p-trade', stepIndex: 1 },
        { pathId: 'state:listing', stepIndex: 1 },
      ],
    });
  });

  it('resolves messages tab to offer step 0', () => {
    expect(resolveSegments(['(tabs)', '(messages)'])).toEqual({
      label: 'Messages',
      flows: [{ pathId: 'state:offer', stepIndex: 0 }],
    });
  });

  it('resolves meetup-location to multiple flows', () => {
    expect(resolveSegments(['(tabs)', '(messages)', 'meetup-location'])).toEqual({
      label: 'Meetup Location',
      flows: [
        { pathId: 'state:meetup', stepIndex: 1 },
        { pathId: 'state:offer', stepIndex: 2 },
      ],
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
      label: 'Discover Feed',
      flows: [{ pathId: 'flow:p2p-trade', stepIndex: 0 }],
    });
  });

  it('resolves numeric dynamic segments', () => {
    expect(resolveSegments(['(tabs)', '(meetups)', '42'])).toEqual({
      label: 'Meetup Detail',
      flows: [{ pathId: 'state:meetup', stepIndex: 1 }],
    });
  });
});
