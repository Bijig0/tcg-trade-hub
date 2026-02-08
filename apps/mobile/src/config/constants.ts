export const DEFAULT_RADIUS_KM = 25;
export const MIN_RADIUS_KM = 5;
export const MAX_RADIUS_KM = 100;

export const MAX_ACTIVE_LISTINGS = 20;
export const LISTING_EXPIRY_DAYS = 30;

export const MAX_SWIPES_PER_DAY = 50;
export const MAX_NEW_CONVERSATIONS_PER_DAY = 10;

export const FEED_PAGE_SIZE_LIST = 20;
export const FEED_PAGE_SIZE_SWIPE = 10;

export const MAX_LISTING_PHOTOS = 5;
export const MAX_RATING_COMMENT_LENGTH = 200;

export const TCG_LABELS = {
  pokemon: 'Pokemon',
  mtg: 'Magic: The Gathering',
  yugioh: 'Yu-Gi-Oh!',
} as const;

export const CONDITION_LABELS = {
  nm: 'Near Mint',
  lp: 'Lightly Played',
  mp: 'Moderately Played',
  hp: 'Heavily Played',
  dmg: 'Damaged',
} as const;

export const LISTING_TYPE_LABELS = {
  wts: 'Want to Sell',
  wtb: 'Want to Buy',
  wtt: 'Want to Trade',
} as const;

export const LISTING_TYPE_SHORT = {
  wts: 'WTS',
  wtb: 'WTB',
  wtt: 'WTT',
} as const;
