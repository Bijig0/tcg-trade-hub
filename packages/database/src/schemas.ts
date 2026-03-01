/**
 * Zod schemas derived from database types.
 * In production, generate with supazod. Manually authored to match spec SQL schema.
 */
import { z } from 'zod';

// --- User role schemas ---
export const USER_ROLES = ['user', 'shop_owner', 'admin'] as const;
export const UserRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof UserRoleSchema>;
export const UserRolesArraySchema = z.array(UserRoleSchema);
export type UserRolesArray = z.infer<typeof UserRolesArraySchema>;

// --- Enum schemas ---
export const TcgTypeSchema = z.enum(['pokemon', 'mtg', 'onepiece', 'lorcana', 'fab', 'starwars']);
export const ListingTypeSchema = z.enum(['wts', 'wtb', 'wtt']);
export const CardConditionSchema = z.enum(['nm', 'lp', 'mp', 'hp', 'dmg']);
export const ListingCategorySchema = z.enum(['singles', 'sealed', 'graded', 'bulk']);
export type ListingCategory = z.infer<typeof ListingCategorySchema>;

export const ListingStatusSchema = z.enum(['active', 'matched', 'completed', 'expired']);
export const SwipeDirectionSchema = z.enum(['like', 'pass']);
export const MatchStatusSchema = z.enum(['active', 'completed', 'cancelled']);
export const MessageTypeSchema = z.enum(['text', 'image', 'card_offer', 'card_offer_response', 'meetup_proposal', 'meetup_response', 'system']);
export const MeetupStatusSchema = z.enum(['proposed', 'confirmed', 'completed', 'cancelled']);
export const ReportCategorySchema = z.enum(['inappropriate_content', 'scam', 'counterfeit', 'no_show', 'harassment', 'other']);
export const ReportStatusSchema = z.enum(['pending', 'reviewed', 'resolved']);
export const GradingCompanySchema = z.enum(['psa', 'cgc', 'bgs']);
export const SealedProductTypeSchema = z.enum(['booster_box', 'etb', 'booster_pack', 'tin', 'collection_box', 'blister']);

// --- Normalized card shape (cross-TCG) ---
export const NormalizedCardSchema = z.object({
  externalId: z.string(),
  tcg: TcgTypeSchema,
  name: z.string(),
  setName: z.string(),
  setCode: z.string(),
  number: z.string(),
  imageUrl: z.string(),
  marketPrice: z.number().nullable(),
  rarity: z.string(),
});

export type NormalizedCard = z.infer<typeof NormalizedCardSchema>;

// --- CardRef (used in offer payloads) ---
export const CardRefSchema = z.object({
  externalId: z.string(),
  tcg: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  condition: CardConditionSchema.optional(),
  quantity: z.number().int().positive().optional(),
});

export type CardRef = z.infer<typeof CardRefSchema>;

// --- Row schemas ---
export const UserRowSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().min(1),
  avatar_url: z.string().nullable(),
  location: z.unknown().nullable(),
  radius_km: z.number().int().min(5).max(100),
  preferred_tcgs: z.array(TcgTypeSchema),
  rating_score: z.number(),
  total_trades: z.number().int(),
  expo_push_token: z.string().nullable(),
  auto_match: z.boolean(),
  deleted_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const UserInsertSchema = UserRowSchema.omit({
  rating_score: true,
  total_trades: true,
  deleted_at: true,
  created_at: true,
  updated_at: true,
}).extend({
  radius_km: z.number().int().min(5).max(100).default(25),
  preferred_tcgs: z.array(TcgTypeSchema).default([]),
  expo_push_token: z.string().nullable().optional(),
  auto_match: z.boolean().default(false),
  avatar_url: z.string().nullable().optional(),
  location: z.unknown().nullable().optional(),
});

export const CollectionItemRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  tcg: TcgTypeSchema,
  external_id: z.string(),
  card_name: z.string(),
  set_name: z.string(),
  set_code: z.string(),
  card_number: z.string(),
  image_url: z.string(),
  rarity: z.string().nullable(),
  condition: CardConditionSchema,
  quantity: z.number().int().positive(),
  is_wishlist: z.boolean(),
  market_price: z.number().nullable(),
  grading_company: GradingCompanySchema.nullable(),
  grading_score: z.string().nullable(),
  is_sealed: z.boolean(),
  product_type: SealedProductTypeSchema.nullable(),
  purchase_price: z.number().nullable(),
  photos: z.array(z.string()),
  notes: z.string().nullable(),
  acquired_at: z.string().nullable(),
  is_tradeable: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CollectionItemUpdateSchema = CollectionItemRowSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
}).partial();

export const CollectionItemInsertSchema = CollectionItemRowSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  condition: CardConditionSchema.default('nm'),
  quantity: z.number().int().positive().default(1),
  is_wishlist: z.boolean().default(false),
  market_price: z.number().nullable().optional(),
  grading_company: GradingCompanySchema.nullable().optional(),
  grading_score: z.string().nullable().optional(),
  is_sealed: z.boolean().default(false),
  product_type: SealedProductTypeSchema.nullable().optional(),
  purchase_price: z.number().nullable().optional(),
  photos: z.array(z.string()).default([]),
  notes: z.string().nullable().optional(),
  acquired_at: z.string().nullable().optional(),
  is_tradeable: z.boolean().default(true),
});

export const OfferStatusSchema = z.enum(['pending', 'accepted', 'declined', 'countered', 'withdrawn']);

// --- Trade want schemas (discriminated union for WTT listing wants) ---

const TradeWantSpecificCardSchema = z.object({
  type: z.literal('specific_card'),
  card_external_id: z.string(),
  card_name: z.string(),
  card_image_url: z.string().nullable().optional(),
  tcg: TcgTypeSchema,
});

const TradeWantSealedSchema = z.object({
  type: z.literal('sealed'),
  product_type: SealedProductTypeSchema.nullable(),
});

const TradeWantSlabSchema = z.object({
  type: z.literal('slab'),
  grading_company: GradingCompanySchema.nullable(),
  min_grade: z.number().min(1).max(10).nullable(),
});

const TradeWantRawCardsSchema = z.object({
  type: z.literal('raw_cards'),
  min_condition: CardConditionSchema.nullable(),
});

const TradeWantCashSchema = z.object({
  type: z.literal('cash'),
  min_amount: z.number().nullable(),
});

const TradeWantOpenSchema = z.object({
  type: z.literal('open_to_offers'),
});

const TradeWantCustomSchema = z.object({
  type: z.literal('custom'),
  label: z.string().max(50),
});

export const TradeWantSchema = z.discriminatedUnion('type', [
  TradeWantSpecificCardSchema,
  TradeWantSealedSchema,
  TradeWantSlabSchema,
  TradeWantRawCardsSchema,
  TradeWantCashSchema,
  TradeWantOpenSchema,
  TradeWantCustomSchema,
]);

export type TradeWant = z.infer<typeof TradeWantSchema>;

export const ListingRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: ListingTypeSchema,
  tcg: TcgTypeSchema,
  category: ListingCategorySchema,
  title: z.string(),
  cash_amount: z.number(),
  total_value: z.number(),
  description: z.string().nullable(),
  photos: z.array(z.string()),
  trade_wants: z.array(TradeWantSchema),
  accepts_cash: z.boolean(),
  accepts_trades: z.boolean(),
  location: z.unknown().nullable(),
  location_name: z.string().nullable(),
  status: ListingStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const ListingInsertSchema = ListingRowSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true,
}).extend({
  category: ListingCategorySchema.default('singles'),
  cash_amount: z.number().default(0),
  total_value: z.number().default(0),
  description: z.string().nullable().optional(),
  photos: z.array(z.string()).default([]),
  trade_wants: z.array(TradeWantSchema).default([]),
  accepts_cash: z.boolean().default(false),
  accepts_trades: z.boolean().default(false),
  location: z.unknown().nullable().optional(),
  location_name: z.string().nullable().optional(),
});

export const ListingItemRowSchema = z.object({
  id: z.string().uuid(),
  listing_id: z.string().uuid(),
  collection_item_id: z.string().uuid().nullable(),
  card_name: z.string(),
  card_image_url: z.string(),
  card_external_id: z.string(),
  tcg: TcgTypeSchema,
  card_set: z.string().nullable(),
  card_number: z.string().nullable(),
  card_rarity: z.string().nullable(),
  condition: CardConditionSchema,
  market_price: z.number().nullable(),
  asking_price: z.number().nullable(),
  quantity: z.number().int().positive(),
  notes: z.string().nullable(),
  created_at: z.string(),
});

export const ListingItemInsertSchema = ListingItemRowSchema.omit({
  id: true,
  created_at: true,
}).extend({
  collection_item_id: z.string().uuid().nullable().optional(),
  card_set: z.string().nullable().optional(),
  card_number: z.string().nullable().optional(),
  card_rarity: z.string().nullable().optional(),
  condition: CardConditionSchema.default('nm'),
  market_price: z.number().nullable().optional(),
  asking_price: z.number().nullable().optional(),
  quantity: z.number().int().positive().default(1),
  notes: z.string().nullable().optional(),
});

export const OfferRowSchema = z.object({
  id: z.string().uuid(),
  listing_id: z.string().uuid(),
  offerer_id: z.string().uuid(),
  status: OfferStatusSchema,
  cash_amount: z.number(),
  offerer_note: z.string().nullable(),
  parent_offer_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const OfferInsertSchema = OfferRowSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true,
}).extend({
  cash_amount: z.number().default(0),
  offerer_note: z.string().nullable().optional(),
  parent_offer_id: z.string().uuid().nullable().optional(),
});

export const OfferItemRowSchema = z.object({
  id: z.string().uuid(),
  offer_id: z.string().uuid(),
  collection_item_id: z.string().uuid().nullable(),
  card_name: z.string(),
  card_image_url: z.string(),
  card_external_id: z.string(),
  tcg: TcgTypeSchema,
  card_set: z.string().nullable(),
  card_number: z.string().nullable(),
  condition: CardConditionSchema,
  market_price: z.number().nullable(),
  quantity: z.number().int().positive(),
  created_at: z.string(),
});

export const OfferItemInsertSchema = OfferItemRowSchema.omit({
  id: true,
  created_at: true,
}).extend({
  collection_item_id: z.string().uuid().nullable().optional(),
  card_set: z.string().nullable().optional(),
  card_number: z.string().nullable().optional(),
  condition: CardConditionSchema.default('nm'),
  market_price: z.number().nullable().optional(),
  quantity: z.number().int().positive().default(1),
});

export const SwipeRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  listing_id: z.string().uuid(),
  direction: SwipeDirectionSchema,
  created_at: z.string(),
});

export const MatchRowSchema = z.object({
  id: z.string().uuid(),
  user_a_id: z.string().uuid(),
  user_b_id: z.string().uuid(),
  listing_id: z.string().uuid(),
  offer_id: z.string().uuid(),
  status: MatchStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const NegotiationStatusSchema = z.enum([
  'chatting',
  'offer_pending',
  'offer_accepted',
  'meetup_proposed',
  'meetup_confirmed',
  'completed',
  'cancelled',
]);

export const ConversationRowSchema = z.object({
  id: z.string().uuid(),
  match_id: z.string().uuid(),
  negotiation_status: NegotiationStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const ConversationReadsRowSchema = z.object({
  conversation_id: z.string().uuid(),
  user_id: z.string().uuid(),
  last_read_message_id: z.string().uuid().nullable(),
  last_read_at: z.string(),
});

export const MessageRowSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  type: MessageTypeSchema,
  body: z.string().nullable(),
  payload: z.unknown().nullable(),
  created_at: z.string(),
});

export const MeetupRowSchema = z.object({
  id: z.string().uuid(),
  match_id: z.string().uuid(),
  proposal_message_id: z.string().uuid(),
  shop_id: z.string().uuid().nullable(),
  location_name: z.string().nullable(),
  location_coords: z.unknown().nullable(),
  proposed_time: z.string().nullable(),
  status: MeetupStatusSchema,
  user_a_completed: z.boolean(),
  user_b_completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ShopEventStatusSchema = z.enum(['draft', 'published', 'cancelled', 'completed']);
export const ShopEventTypeSchema = z.enum(['tournament', 'league', 'prerelease', 'casual', 'draft', 'sealed', 'other']);

export const ShopRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  suburb: z.string().nullable(),
  location: z.unknown(),
  hours: z.unknown().nullable(),
  website: z.string().nullable(),
  phone: z.string().nullable(),
  supported_tcgs: z.array(TcgTypeSchema),
  verified: z.boolean(),
  owner_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  email: z.string().nullable(),
  logo_url: z.string().nullable(),
  cover_photo_url: z.string().nullable(),
  google_rating: z.number().nullable(),
  google_review_count: z.number().int().nullable(),
  social_links: z.unknown().nullable(),
  hosts_events: z.boolean(),
  seating_capacity: z.number().int().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ShopInsertSchema = ShopRowSchema.omit({
  id: true,
  verified: true,
  created_at: true,
  updated_at: true,
}).extend({
  suburb: z.string().nullable().optional(),
  hours: z.unknown().nullable().optional(),
  website: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  supported_tcgs: z.array(TcgTypeSchema).default([]),
  owner_id: z.string().uuid().nullable().optional(),
  description: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  cover_photo_url: z.string().nullable().optional(),
  google_rating: z.number().nullable().optional(),
  google_review_count: z.number().int().nullable().optional(),
  social_links: z.unknown().nullable().optional(),
  hosts_events: z.boolean().default(false),
  seating_capacity: z.number().int().nullable().optional(),
});

export const ShopUpdateSchema = ShopRowSchema.omit({
  id: true,
  owner_id: true,
  verified: true,
  created_at: true,
  updated_at: true,
}).partial();

export const ShopEventRowSchema = z.object({
  id: z.string().uuid(),
  shop_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  event_type: z.string(),
  tcg: TcgTypeSchema.nullable(),
  starts_at: z.string(),
  ends_at: z.string().nullable(),
  max_participants: z.number().int().positive().nullable(),
  entry_fee: z.number().nullable(),
  image_url: z.string().nullable(),
  status: ShopEventStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const ShopEventInsertSchema = ShopEventRowSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true,
}).extend({
  description: z.string().nullable().optional(),
  tcg: TcgTypeSchema.nullable().optional(),
  ends_at: z.string().nullable().optional(),
  max_participants: z.number().int().positive().nullable().optional(),
  entry_fee: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

export const ShopEventUpdateSchema = ShopEventRowSchema.omit({
  id: true,
  shop_id: true,
  status: true,
  created_at: true,
  updated_at: true,
}).partial();

export const ShopNotificationRowSchema = z.object({
  id: z.string().uuid(),
  shop_id: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  payload: z.unknown().nullable(),
  read: z.boolean(),
  created_at: z.string(),
});

export const RatingRowSchema = z.object({
  id: z.string().uuid(),
  meetup_id: z.string().uuid(),
  rater_id: z.string().uuid(),
  ratee_id: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(200).nullable(),
  created_at: z.string(),
});

export const RatingInsertSchema = RatingRowSchema.omit({
  id: true,
  created_at: true,
});

export const BlockRowSchema = z.object({
  id: z.string().uuid(),
  blocker_id: z.string().uuid(),
  blocked_id: z.string().uuid(),
  created_at: z.string(),
});

export const ReportRowSchema = z.object({
  id: z.string().uuid(),
  reporter_id: z.string().uuid(),
  reported_user_id: z.string().uuid(),
  reported_message_id: z.string().uuid().nullable(),
  category: ReportCategorySchema,
  description: z.string().nullable(),
  status: ReportStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const ReportInsertSchema = ReportRowSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true,
});

// --- Message payload schemas ---

export const NoteEntrySchema = z.object({
  author_id: z.string().uuid(),
  author_name: z.string(),
  author_avatar_url: z.string().nullable(),
  text: z.string().min(1).max(500),
  created_at: z.string(),
});
export type NoteEntry = z.infer<typeof NoteEntrySchema>;

export const CardOfferPayloadSchema = z.object({
  offering: z.array(CardRefSchema),
  requesting: z.array(CardRefSchema),
  cash_amount: z.number().optional(),
  cash_direction: z.enum(['offering', 'requesting']).optional(),
  offering_note: z.string().optional(),
  requesting_note: z.string().optional(),
  /** @deprecated Use offering_note / requesting_note. Kept for backward compat with old messages. */
  note: z.string().optional(),
  /** Multi-author notes on the offering side. Takes precedence over offering_note. */
  offering_notes: z.array(NoteEntrySchema).optional(),
  /** Multi-author notes on the requesting side. Takes precedence over requesting_note. */
  requesting_notes: z.array(NoteEntrySchema).optional(),
});

export type CardOfferPayload = z.infer<typeof CardOfferPayloadSchema>;

export const CardOfferResponsePayloadSchema = z.object({
  offer_message_id: z.string().uuid(),
  action: z.enum(['accepted', 'declined']),
});

export type CardOfferResponsePayload = z.infer<typeof CardOfferResponsePayloadSchema>;

export const MeetupProposalPayloadSchema = z.object({
  shop_id: z.string().uuid().optional(),
  location_name: z.string().optional(),
  location_coords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  proposed_time: z.string().datetime().optional(),
  note: z.string().optional(),
});

export type MeetupProposalPayload = z.infer<typeof MeetupProposalPayloadSchema>;

export const MeetupResponsePayloadSchema = z.object({
  proposal_message_id: z.string().uuid(),
  action: z.enum(['accepted', 'declined']),
});

export type MeetupResponsePayload = z.infer<typeof MeetupResponsePayloadSchema>;

export const SystemPayloadSchema = z.object({
  event: z.string(),
});

export type SystemPayload = z.infer<typeof SystemPayloadSchema>;

export const ImagePayloadSchema = z.object({
  url: z.string().url(),
});

export type ImagePayload = z.infer<typeof ImagePayloadSchema>;

// Discriminated union for all message types
export const MessagePayloadSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text') }),
  z.object({ type: z.literal('image'), payload: ImagePayloadSchema }),
  z.object({ type: z.literal('card_offer'), payload: CardOfferPayloadSchema }),
  z.object({ type: z.literal('card_offer_response'), payload: CardOfferResponsePayloadSchema }),
  z.object({ type: z.literal('meetup_proposal'), payload: MeetupProposalPayloadSchema }),
  z.object({ type: z.literal('meetup_response'), payload: MeetupResponsePayloadSchema }),
  z.object({ type: z.literal('system'), payload: SystemPayloadSchema }),
]);

export type MessagePayload = z.infer<typeof MessagePayloadSchema>;

// --- Pre-registration schemas ---
export const PreRegistrationRowSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  tcg: TcgTypeSchema,
  trade_data: z.unknown().nullable(),
  listing_type: ListingTypeSchema,
  asking_price: z.number().nullable(),
  city: z.string().nullable(),
  zip_code: z.string().nullable(),
  country: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PreRegistrationRow = z.infer<typeof PreRegistrationRowSchema>;

export const PreRegistrationInsertSchema = PreRegistrationRowSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  display_name: z.string().nullable().optional(),
  trade_data: z.unknown().nullable().optional(),
  asking_price: z.number().positive().nullable().optional(),
  city: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

export type PreRegistrationInsert = z.infer<typeof PreRegistrationInsertSchema>;
