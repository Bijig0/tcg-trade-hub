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
  onepiece: 'One Piece',
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

export const GRADING_COMPANY_LABELS = {
  psa: 'PSA',
  cgc: 'CGC',
  bgs: 'BGS',
} as const;

export const SEALED_PRODUCT_TYPE_LABELS = {
  booster_box: 'Booster Box',
  etb: 'Elite Trainer Box',
  booster_pack: 'Booster Pack',
  tin: 'Tin',
  collection_box: 'Collection Box',
  blister: 'Blister',
} as const;

/** PSA: integers 1-10. CGC/BGS: 1-10 with half steps. */
export const GRADING_SCORE_OPTIONS = {
  psa: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  cgc: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'],
  bgs: ['1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', 'Pristine 10'],
} as const;
