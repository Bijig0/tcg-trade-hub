import { describe, it, expect } from 'vitest';
import buildExclusionSets from './buildExclusionSets';

const USER_ID = 'user-1';

describe('buildExclusionSets', () => {
  it('should extract swiped listing IDs', () => {
    const swipes = [
      { listing_id: 'listing-a' },
      { listing_id: 'listing-b' },
    ];
    const result = buildExclusionSets(swipes, null, USER_ID);
    expect(result.swipedIds).toEqual(['listing-a', 'listing-b']);
    expect(result.blockedUserIds).toEqual([]);
  });

  it('should extract blocked user IDs from both directions', () => {
    const blocks = [
      { blocker_id: USER_ID, blocked_id: 'user-2' },
      { blocker_id: 'user-3', blocked_id: USER_ID },
    ];
    const result = buildExclusionSets(null, blocks, USER_ID);
    expect(result.swipedIds).toEqual([]);
    expect(result.blockedUserIds).toEqual(['user-2', 'user-3']);
  });

  it('should handle null inputs', () => {
    const result = buildExclusionSets(null, null, USER_ID);
    expect(result.swipedIds).toEqual([]);
    expect(result.blockedUserIds).toEqual([]);
  });

  it('should handle empty arrays', () => {
    const result = buildExclusionSets([], [], USER_ID);
    expect(result.swipedIds).toEqual([]);
    expect(result.blockedUserIds).toEqual([]);
  });

  it('should handle mixed swipes and blocks', () => {
    const swipes = [{ listing_id: 'listing-x' }];
    const blocks = [
      { blocker_id: USER_ID, blocked_id: 'user-5' },
      { blocker_id: 'user-6', blocked_id: USER_ID },
    ];
    const result = buildExclusionSets(swipes, blocks, USER_ID);
    expect(result.swipedIds).toEqual(['listing-x']);
    expect(result.blockedUserIds).toEqual(['user-5', 'user-6']);
  });
});
