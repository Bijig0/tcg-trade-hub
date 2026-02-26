export type SwipeRow = { listing_id: string };
export type BlockRow = { blocker_id: string; blocked_id: string };

type ExclusionSets = {
  swipedIds: string[];
  blockedUserIds: string[];
};

/**
 * Extracts exclusion sets from raw swipe and block rows.
 *
 * Produces two arrays:
 * - `swipedIds`: listing IDs the user has already swiped on
 * - `blockedUserIds`: user IDs blocked in either direction
 */
const buildExclusionSets = (
  swipes: SwipeRow[] | null,
  blocks: BlockRow[] | null,
  currentUserId: string,
): ExclusionSets => {
  const swipedIds = (swipes ?? []).map((s) => s.listing_id);

  const blockedUserIds: string[] = [];
  for (const block of blocks ?? []) {
    if (block.blocker_id === currentUserId) {
      blockedUserIds.push(block.blocked_id);
    } else {
      blockedUserIds.push(block.blocker_id);
    }
  }

  return { swipedIds, blockedUserIds };
};

export default buildExclusionSets;
