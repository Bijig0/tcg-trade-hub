import { R as RPCHandler, o as os$1 } from "../_chunks/_libs/@orpc/server.mjs";
import { c as createClient } from "../_chunks/_libs/@supabase/supabase-js.mjs";
import { w as onError } from "../_chunks/_libs/@orpc/shared.mjs";
import { o as objectType, a as arrayType, s as stringType, b as booleanType, n as numberType, v as voidType, u as unknownType, e as enumType, l as literalType, d as discriminatedUnionType } from "../_libs/zod.mjs";
import "../_chunks/_libs/@orpc/standard-server-fetch.mjs";
import "../_chunks/_libs/@orpc/standard-server.mjs";
import "../_chunks/_libs/@orpc/client.mjs";
import "../_chunks/_libs/@orpc/contract.mjs";
import "../_chunks/_libs/@supabase/postgrest-js.mjs";
import "../_chunks/_libs/@supabase/realtime-js.mjs";
import "../_chunks/_libs/@supabase/storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_chunks/_libs/@supabase/auth-js.mjs";
import "../_libs/tslib.mjs";
import "../_chunks/_libs/@supabase/functions-js.mjs";
const os = os$1.$context();
const USER_ROLES = ["user", "shop_owner", "admin"];
const UserRoleSchema = enumType(USER_ROLES);
arrayType(UserRoleSchema);
const TcgTypeSchema = enumType(["pokemon", "mtg", "yugioh"]);
const ListingTypeSchema = enumType(["wts", "wtb", "wtt"]);
const CardConditionSchema = enumType(["nm", "lp", "mp", "hp", "dmg"]);
const ListingStatusSchema = enumType(["active", "matched", "completed", "expired"]);
const SwipeDirectionSchema = enumType(["like", "pass"]);
const MatchStatusSchema = enumType(["active", "completed", "cancelled"]);
const MessageTypeSchema = enumType(["text", "image", "card_offer", "card_offer_response", "meetup_proposal", "meetup_response", "system"]);
const MeetupStatusSchema = enumType(["proposed", "confirmed", "completed", "cancelled"]);
const ReportCategorySchema = enumType(["inappropriate_content", "scam", "counterfeit", "no_show", "harassment", "other"]);
const ReportStatusSchema = enumType(["pending", "reviewed", "resolved"]);
const GradingCompanySchema = enumType(["psa", "cgc", "bgs"]);
const SealedProductTypeSchema = enumType(["booster_box", "etb", "booster_pack", "tin", "collection_box", "blister"]);
const NormalizedCardSchema = objectType({
  externalId: stringType(),
  tcg: TcgTypeSchema,
  name: stringType(),
  setName: stringType(),
  setCode: stringType(),
  number: stringType(),
  imageUrl: stringType().url(),
  marketPrice: numberType().nullable(),
  rarity: stringType()
});
const CardRefSchema = objectType({
  externalId: stringType(),
  tcg: stringType(),
  name: stringType(),
  imageUrl: stringType(),
  condition: CardConditionSchema.optional(),
  quantity: numberType().int().positive().optional()
});
const UserRowSchema = objectType({
  id: stringType().uuid(),
  email: stringType().email(),
  display_name: stringType().min(1),
  avatar_url: stringType().nullable(),
  location: unknownType().nullable(),
  radius_km: numberType().int().min(5).max(100),
  preferred_tcgs: arrayType(TcgTypeSchema),
  rating_score: numberType(),
  total_trades: numberType().int(),
  expo_push_token: stringType().nullable(),
  auto_match: booleanType(),
  deleted_at: stringType().nullable(),
  created_at: stringType(),
  updated_at: stringType()
});
UserRowSchema.omit({
  rating_score: true,
  total_trades: true,
  deleted_at: true,
  created_at: true,
  updated_at: true
}).extend({
  radius_km: numberType().int().min(5).max(100).default(25),
  preferred_tcgs: arrayType(TcgTypeSchema).default([]),
  expo_push_token: stringType().nullable().optional(),
  auto_match: booleanType().default(false),
  avatar_url: stringType().nullable().optional(),
  location: unknownType().nullable().optional()
});
const CollectionItemRowSchema = objectType({
  id: stringType().uuid(),
  user_id: stringType().uuid(),
  tcg: TcgTypeSchema,
  external_id: stringType(),
  card_name: stringType(),
  set_name: stringType(),
  set_code: stringType(),
  card_number: stringType(),
  image_url: stringType(),
  rarity: stringType().nullable(),
  condition: CardConditionSchema,
  quantity: numberType().int().positive(),
  is_wishlist: booleanType(),
  market_price: numberType().nullable(),
  grading_company: GradingCompanySchema.nullable(),
  grading_score: stringType().nullable(),
  is_sealed: booleanType(),
  product_type: SealedProductTypeSchema.nullable(),
  purchase_price: numberType().nullable(),
  photos: arrayType(stringType()),
  notes: stringType().nullable(),
  acquired_at: stringType().nullable(),
  is_tradeable: booleanType(),
  created_at: stringType(),
  updated_at: stringType()
});
CollectionItemRowSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  condition: CardConditionSchema.default("nm"),
  quantity: numberType().int().positive().default(1),
  is_wishlist: booleanType().default(false),
  market_price: numberType().nullable().optional(),
  grading_company: GradingCompanySchema.nullable().optional(),
  grading_score: stringType().nullable().optional(),
  is_sealed: booleanType().default(false),
  product_type: SealedProductTypeSchema.nullable().optional(),
  purchase_price: numberType().nullable().optional(),
  photos: arrayType(stringType()).default([]),
  notes: stringType().nullable().optional(),
  acquired_at: stringType().nullable().optional(),
  is_tradeable: booleanType().default(true)
});
const OfferStatusSchema = enumType(["pending", "accepted", "declined", "countered", "withdrawn"]);
const TradeWantSpecificCardSchema = objectType({
  type: literalType("specific_card"),
  card_external_id: stringType(),
  card_name: stringType(),
  card_image_url: stringType().nullable().optional(),
  tcg: TcgTypeSchema
});
const TradeWantSealedSchema = objectType({
  type: literalType("sealed"),
  product_type: SealedProductTypeSchema.nullable()
});
const TradeWantSlabSchema = objectType({
  type: literalType("slab"),
  grading_company: GradingCompanySchema.nullable(),
  min_grade: numberType().min(1).max(10).nullable()
});
const TradeWantRawCardsSchema = objectType({
  type: literalType("raw_cards"),
  min_condition: CardConditionSchema.nullable()
});
const TradeWantCashSchema = objectType({
  type: literalType("cash"),
  min_amount: numberType().nullable()
});
const TradeWantOpenSchema = objectType({
  type: literalType("open_to_offers")
});
const TradeWantCustomSchema = objectType({
  type: literalType("custom"),
  label: stringType().max(50)
});
const TradeWantSchema = discriminatedUnionType("type", [
  TradeWantSpecificCardSchema,
  TradeWantSealedSchema,
  TradeWantSlabSchema,
  TradeWantRawCardsSchema,
  TradeWantCashSchema,
  TradeWantOpenSchema,
  TradeWantCustomSchema
]);
const ListingRowSchema = objectType({
  id: stringType().uuid(),
  user_id: stringType().uuid(),
  type: ListingTypeSchema,
  tcg: TcgTypeSchema,
  title: stringType(),
  cash_amount: numberType(),
  total_value: numberType(),
  description: stringType().nullable(),
  photos: arrayType(stringType()),
  trade_wants: arrayType(TradeWantSchema),
  status: ListingStatusSchema,
  created_at: stringType(),
  updated_at: stringType()
});
ListingRowSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true
}).extend({
  cash_amount: numberType().default(0),
  total_value: numberType().default(0),
  description: stringType().nullable().optional(),
  photos: arrayType(stringType()).default([]),
  trade_wants: arrayType(TradeWantSchema).default([])
});
const ListingItemRowSchema = objectType({
  id: stringType().uuid(),
  listing_id: stringType().uuid(),
  collection_item_id: stringType().uuid().nullable(),
  card_name: stringType(),
  card_image_url: stringType(),
  card_external_id: stringType(),
  tcg: TcgTypeSchema,
  card_set: stringType().nullable(),
  card_number: stringType().nullable(),
  card_rarity: stringType().nullable(),
  condition: CardConditionSchema,
  market_price: numberType().nullable(),
  asking_price: numberType().nullable(),
  quantity: numberType().int().positive(),
  created_at: stringType()
});
ListingItemRowSchema.omit({
  id: true,
  created_at: true
}).extend({
  collection_item_id: stringType().uuid().nullable().optional(),
  card_set: stringType().nullable().optional(),
  card_number: stringType().nullable().optional(),
  card_rarity: stringType().nullable().optional(),
  condition: CardConditionSchema.default("nm"),
  market_price: numberType().nullable().optional(),
  asking_price: numberType().nullable().optional(),
  quantity: numberType().int().positive().default(1)
});
const OfferRowSchema = objectType({
  id: stringType().uuid(),
  listing_id: stringType().uuid(),
  offerer_id: stringType().uuid(),
  status: OfferStatusSchema,
  cash_amount: numberType(),
  offerer_note: stringType().nullable(),
  parent_offer_id: stringType().uuid().nullable(),
  created_at: stringType(),
  updated_at: stringType()
});
OfferRowSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true
}).extend({
  cash_amount: numberType().default(0),
  offerer_note: stringType().nullable().optional(),
  parent_offer_id: stringType().uuid().nullable().optional()
});
const OfferItemRowSchema = objectType({
  id: stringType().uuid(),
  offer_id: stringType().uuid(),
  collection_item_id: stringType().uuid().nullable(),
  card_name: stringType(),
  card_image_url: stringType(),
  card_external_id: stringType(),
  tcg: TcgTypeSchema,
  card_set: stringType().nullable(),
  card_number: stringType().nullable(),
  condition: CardConditionSchema,
  market_price: numberType().nullable(),
  quantity: numberType().int().positive(),
  created_at: stringType()
});
OfferItemRowSchema.omit({
  id: true,
  created_at: true
}).extend({
  collection_item_id: stringType().uuid().nullable().optional(),
  card_set: stringType().nullable().optional(),
  card_number: stringType().nullable().optional(),
  condition: CardConditionSchema.default("nm"),
  market_price: numberType().nullable().optional(),
  quantity: numberType().int().positive().default(1)
});
objectType({
  id: stringType().uuid(),
  user_id: stringType().uuid(),
  listing_id: stringType().uuid(),
  direction: SwipeDirectionSchema,
  created_at: stringType()
});
objectType({
  id: stringType().uuid(),
  user_a_id: stringType().uuid(),
  user_b_id: stringType().uuid(),
  listing_id: stringType().uuid(),
  offer_id: stringType().uuid(),
  status: MatchStatusSchema,
  created_at: stringType(),
  updated_at: stringType()
});
const NegotiationStatusSchema = enumType([
  "chatting",
  "offer_pending",
  "offer_accepted",
  "meetup_proposed",
  "meetup_confirmed",
  "completed",
  "cancelled"
]);
objectType({
  id: stringType().uuid(),
  match_id: stringType().uuid(),
  negotiation_status: NegotiationStatusSchema,
  created_at: stringType(),
  updated_at: stringType()
});
objectType({
  conversation_id: stringType().uuid(),
  user_id: stringType().uuid(),
  last_read_message_id: stringType().uuid().nullable(),
  last_read_at: stringType()
});
objectType({
  id: stringType().uuid(),
  conversation_id: stringType().uuid(),
  sender_id: stringType().uuid(),
  type: MessageTypeSchema,
  body: stringType().nullable(),
  payload: unknownType().nullable(),
  created_at: stringType()
});
objectType({
  id: stringType().uuid(),
  match_id: stringType().uuid(),
  proposal_message_id: stringType().uuid(),
  shop_id: stringType().uuid().nullable(),
  location_name: stringType().nullable(),
  location_coords: unknownType().nullable(),
  proposed_time: stringType().nullable(),
  status: MeetupStatusSchema,
  user_a_completed: booleanType(),
  user_b_completed: booleanType(),
  created_at: stringType(),
  updated_at: stringType()
});
const ShopEventStatusSchema = enumType(["draft", "published", "cancelled", "completed"]);
enumType(["tournament", "league", "prerelease", "casual", "draft", "sealed", "other"]);
const ShopRowSchema = objectType({
  id: stringType().uuid(),
  name: stringType(),
  address: stringType(),
  location: unknownType(),
  hours: unknownType().nullable(),
  website: stringType().nullable(),
  phone: stringType().nullable(),
  supported_tcgs: arrayType(TcgTypeSchema),
  verified: booleanType(),
  owner_id: stringType().uuid().nullable(),
  description: stringType().nullable(),
  email: stringType().nullable(),
  logo_url: stringType().nullable(),
  cover_photo_url: stringType().nullable(),
  created_at: stringType(),
  updated_at: stringType()
});
const ShopInsertSchema = ShopRowSchema.omit({
  id: true,
  verified: true,
  created_at: true,
  updated_at: true
}).extend({
  hours: unknownType().nullable().optional(),
  website: stringType().nullable().optional(),
  phone: stringType().nullable().optional(),
  supported_tcgs: arrayType(TcgTypeSchema).default([]),
  owner_id: stringType().uuid().nullable().optional(),
  description: stringType().nullable().optional(),
  email: stringType().nullable().optional(),
  logo_url: stringType().nullable().optional(),
  cover_photo_url: stringType().nullable().optional()
});
const ShopUpdateSchema = ShopRowSchema.omit({
  id: true,
  owner_id: true,
  verified: true,
  created_at: true,
  updated_at: true
}).partial();
const ShopEventRowSchema = objectType({
  id: stringType().uuid(),
  shop_id: stringType().uuid(),
  title: stringType(),
  description: stringType().nullable(),
  event_type: stringType(),
  tcg: TcgTypeSchema.nullable(),
  starts_at: stringType(),
  ends_at: stringType().nullable(),
  max_participants: numberType().int().positive().nullable(),
  entry_fee: numberType().nullable(),
  image_url: stringType().nullable(),
  status: ShopEventStatusSchema,
  created_at: stringType(),
  updated_at: stringType()
});
const ShopEventInsertSchema = ShopEventRowSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true
}).extend({
  description: stringType().nullable().optional(),
  tcg: TcgTypeSchema.nullable().optional(),
  ends_at: stringType().nullable().optional(),
  max_participants: numberType().int().positive().nullable().optional(),
  entry_fee: numberType().nullable().optional(),
  image_url: stringType().nullable().optional()
});
const ShopEventUpdateSchema = ShopEventRowSchema.omit({
  id: true,
  shop_id: true,
  status: true,
  created_at: true,
  updated_at: true
}).partial();
const ShopNotificationRowSchema = objectType({
  id: stringType().uuid(),
  shop_id: stringType().uuid(),
  type: stringType(),
  title: stringType(),
  body: stringType().nullable(),
  payload: unknownType().nullable(),
  read: booleanType(),
  created_at: stringType()
});
const RatingRowSchema = objectType({
  id: stringType().uuid(),
  meetup_id: stringType().uuid(),
  rater_id: stringType().uuid(),
  ratee_id: stringType().uuid(),
  score: numberType().int().min(1).max(5),
  comment: stringType().max(200).nullable(),
  created_at: stringType()
});
RatingRowSchema.omit({
  id: true,
  created_at: true
});
objectType({
  id: stringType().uuid(),
  blocker_id: stringType().uuid(),
  blocked_id: stringType().uuid(),
  created_at: stringType()
});
const ReportRowSchema = objectType({
  id: stringType().uuid(),
  reporter_id: stringType().uuid(),
  reported_user_id: stringType().uuid(),
  reported_message_id: stringType().uuid().nullable(),
  category: ReportCategorySchema,
  description: stringType().nullable(),
  status: ReportStatusSchema,
  created_at: stringType(),
  updated_at: stringType()
});
ReportRowSchema.omit({
  id: true,
  status: true,
  created_at: true,
  updated_at: true
});
const NoteEntrySchema = objectType({
  author_id: stringType().uuid(),
  author_name: stringType(),
  author_avatar_url: stringType().nullable(),
  text: stringType().min(1).max(500),
  created_at: stringType()
});
const CardOfferPayloadSchema = objectType({
  offering: arrayType(CardRefSchema),
  requesting: arrayType(CardRefSchema),
  cash_amount: numberType().optional(),
  cash_direction: enumType(["offering", "requesting"]).optional(),
  offering_note: stringType().optional(),
  requesting_note: stringType().optional(),
  /** @deprecated Use offering_note / requesting_note. Kept for backward compat with old messages. */
  note: stringType().optional(),
  /** Multi-author notes on the offering side. Takes precedence over offering_note. */
  offering_notes: arrayType(NoteEntrySchema).optional(),
  /** Multi-author notes on the requesting side. Takes precedence over requesting_note. */
  requesting_notes: arrayType(NoteEntrySchema).optional()
});
const CardOfferResponsePayloadSchema = objectType({
  offer_message_id: stringType().uuid(),
  action: enumType(["accepted", "declined"])
});
const MeetupProposalPayloadSchema = objectType({
  shop_id: stringType().uuid().optional(),
  location_name: stringType().optional(),
  location_coords: objectType({ lat: numberType(), lng: numberType() }).optional(),
  proposed_time: stringType().datetime().optional(),
  note: stringType().optional()
});
const MeetupResponsePayloadSchema = objectType({
  proposal_message_id: stringType().uuid(),
  action: enumType(["accepted", "declined"])
});
const SystemPayloadSchema = objectType({
  event: stringType()
});
const ImagePayloadSchema = objectType({
  url: stringType().url()
});
discriminatedUnionType("type", [
  objectType({ type: literalType("text") }),
  objectType({ type: literalType("image"), payload: ImagePayloadSchema }),
  objectType({ type: literalType("card_offer"), payload: CardOfferPayloadSchema }),
  objectType({ type: literalType("card_offer_response"), payload: CardOfferResponsePayloadSchema }),
  objectType({ type: literalType("meetup_proposal"), payload: MeetupProposalPayloadSchema }),
  objectType({ type: literalType("meetup_response"), payload: MeetupResponsePayloadSchema }),
  objectType({ type: literalType("system"), payload: SystemPayloadSchema })
]);
const PreRegistrationRowSchema = objectType({
  id: stringType().uuid(),
  email: stringType().email(),
  display_name: stringType().nullable(),
  tcg: TcgTypeSchema,
  card_name: stringType(),
  card_set: stringType().nullable(),
  card_external_id: stringType().nullable(),
  card_image_url: stringType().nullable(),
  listing_type: ListingTypeSchema,
  asking_price: numberType().nullable(),
  city: stringType().nullable(),
  zip_code: stringType().nullable(),
  country: stringType().nullable(),
  created_at: stringType(),
  updated_at: stringType()
});
const PreRegistrationInsertSchema = PreRegistrationRowSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
}).extend({
  display_name: stringType().nullable().optional(),
  card_set: stringType().nullable().optional(),
  card_external_id: stringType().nullable().optional(),
  card_image_url: stringType().nullable().optional(),
  asking_price: numberType().positive().nullable().optional(),
  city: stringType().nullable().optional(),
  zip_code: stringType().nullable().optional(),
  country: stringType().nullable().optional()
});
const LISTING_TRANSITIONS = {
  active: ["matched", "expired"],
  matched: ["completed"],
  completed: [],
  expired: []
};
const OFFER_TRANSITIONS = {
  pending: ["accepted", "declined", "countered", "withdrawn"],
  countered: ["accepted", "declined", "withdrawn"],
  accepted: [],
  declined: [],
  withdrawn: []
};
const MATCH_TRANSITIONS = {
  active: ["completed", "cancelled"],
  completed: [],
  cancelled: []
};
const MEETUP_TRANSITIONS = {
  proposed: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: []
};
const REPORT_TRANSITIONS = {
  pending: ["reviewed"],
  reviewed: ["resolved"],
  resolved: []
};
const SHOP_EVENT_TRANSITIONS = {
  draft: ["published", "cancelled"],
  published: ["cancelled", "completed"],
  cancelled: [],
  completed: []
};
const TRANSITION_MAPS = {
  listing: LISTING_TRANSITIONS,
  offer: OFFER_TRANSITIONS,
  match: MATCH_TRANSITIONS,
  meetup: MEETUP_TRANSITIONS,
  report: REPORT_TRANSITIONS,
  shop_event: SHOP_EVENT_TRANSITIONS
};
const canTransition = (entity, from, to) => {
  const map = TRANSITION_MAPS[entity];
  const allowed = map[from];
  if (!allowed) return false;
  return allowed.includes(to);
};
const getValidTransitions = (entity, from) => {
  const map = TRANSITION_MAPS[entity];
  return map[from] ?? [];
};
const assertTransition = (entity, from, to) => {
  if (!canTransition(entity, from, to)) {
    const valid = getValidTransitions(entity, from);
    throw new Error(
      `Invalid ${entity} status transition: "${from}" → "${to}". ` + (valid.length > 0 ? `Valid transitions from "${from}": ${valid.join(", ")}.` : `"${from}" is a terminal status — no further transitions allowed.`)
    );
  }
};
const create$1 = os.input(PreRegistrationInsertSchema).output(objectType({ success: booleanType(), position: numberType() })).handler(async ({ input, context }) => {
  const { supabase } = context;
  const { error } = await supabase.from("pre_registrations").insert(input);
  if (error) {
    if (error.code === "23505") {
      const { error: upsertError } = await supabase.from("pre_registrations").upsert(input, { onConflict: "email" });
      if (upsertError) {
        throw new Error(`Failed to update registration: ${upsertError.message}`);
      }
    } else {
      throw new Error(`Failed to create registration: ${error.message}`);
    }
  }
  let query = supabase.from("pre_registrations").select("id", { count: "exact", head: true });
  if (input.zip_code) {
    query = query.eq("zip_code", input.zip_code);
  } else if (input.city) {
    query = query.eq("city", input.city);
  }
  const { count } = await query;
  return { success: true, position: count ?? 1 };
});
const MOCK_POKEMON_CARDS = [
  {
    externalId: "sv3pt5-7",
    tcg: "pokemon",
    name: "Charizard ex",
    setName: "151",
    setCode: "sv3pt5",
    number: "6",
    imageUrl: "https://images.pokemontcg.io/sv3pt5/6.png",
    marketPrice: 42.5,
    rarity: "Double Rare"
  },
  {
    externalId: "sv3pt5-199",
    tcg: "pokemon",
    name: "Charizard ex",
    setName: "151",
    setCode: "sv3pt5",
    number: "199",
    imageUrl: "https://images.pokemontcg.io/sv3pt5/199.png",
    marketPrice: 185,
    rarity: "Special Art Rare"
  },
  {
    externalId: "sv4-18",
    tcg: "pokemon",
    name: "Arcanine ex",
    setName: "Paradox Rift",
    setCode: "sv4",
    number: "18",
    imageUrl: "https://images.pokemontcg.io/sv4/18.png",
    marketPrice: 3.25,
    rarity: "Double Rare"
  },
  {
    externalId: "sv3-99",
    tcg: "pokemon",
    name: "Umbreon ex",
    setName: "Obsidian Flames",
    setCode: "sv3",
    number: "99",
    imageUrl: "https://images.pokemontcg.io/sv3/99.png",
    marketPrice: 12.75,
    rarity: "Double Rare"
  },
  {
    externalId: "sv3-228",
    tcg: "pokemon",
    name: "Umbreon ex",
    setName: "Obsidian Flames",
    setCode: "sv3",
    number: "228",
    imageUrl: "https://images.pokemontcg.io/sv3/228.png",
    marketPrice: 95,
    rarity: "Special Art Rare"
  },
  {
    externalId: "sv2-91",
    tcg: "pokemon",
    name: "Pikachu ex",
    setName: "Paldea Evolved",
    setCode: "sv2",
    number: "91",
    imageUrl: "https://images.pokemontcg.io/sv2/91.png",
    marketPrice: 5.5,
    rarity: "Double Rare"
  },
  {
    externalId: "sv1-254",
    tcg: "pokemon",
    name: "Miraidon ex",
    setName: "Scarlet & Violet",
    setCode: "sv1",
    number: "254",
    imageUrl: "https://images.pokemontcg.io/sv1/254.png",
    marketPrice: 22,
    rarity: "Special Art Rare"
  },
  {
    externalId: "sv3pt5-172",
    tcg: "pokemon",
    name: "Mew ex",
    setName: "151",
    setCode: "sv3pt5",
    number: "172",
    imageUrl: "https://images.pokemontcg.io/sv3pt5/172.png",
    marketPrice: 35,
    rarity: "Ultra Rare"
  },
  {
    externalId: "sv4-228",
    tcg: "pokemon",
    name: "Roaring Moon ex",
    setName: "Paradox Rift",
    setCode: "sv4",
    number: "228",
    imageUrl: "https://images.pokemontcg.io/sv4/228.png",
    marketPrice: 55,
    rarity: "Special Art Rare"
  },
  {
    externalId: "sv3-197",
    tcg: "pokemon",
    name: "Charizard ex",
    setName: "Obsidian Flames",
    setCode: "sv3",
    number: "197",
    imageUrl: "https://images.pokemontcg.io/sv3/197.png",
    marketPrice: 120,
    rarity: "Special Art Rare"
  },
  {
    externalId: "sv2-230",
    tcg: "pokemon",
    name: "Iono",
    setName: "Paldea Evolved",
    setCode: "sv2",
    number: "230",
    imageUrl: "https://images.pokemontcg.io/sv2/230.png",
    marketPrice: 65,
    rarity: "Special Art Rare"
  },
  {
    externalId: "sv1-198",
    tcg: "pokemon",
    name: "Gardevoir ex",
    setName: "Scarlet & Violet",
    setCode: "sv1",
    number: "198",
    imageUrl: "https://images.pokemontcg.io/sv1/198.png",
    marketPrice: 15.5,
    rarity: "Ultra Rare"
  },
  {
    externalId: "sv4-139",
    tcg: "pokemon",
    name: "Iron Valiant ex",
    setName: "Paradox Rift",
    setCode: "sv4",
    number: "139",
    imageUrl: "https://images.pokemontcg.io/sv4/139.png",
    marketPrice: 4,
    rarity: "Double Rare"
  },
  {
    externalId: "sv3pt5-25",
    tcg: "pokemon",
    name: "Pikachu",
    setName: "151",
    setCode: "sv3pt5",
    number: "25",
    imageUrl: "https://images.pokemontcg.io/sv3pt5/25.png",
    marketPrice: 1.25,
    rarity: "Common"
  },
  {
    externalId: "sv2-120",
    tcg: "pokemon",
    name: "Mewtwo ex",
    setName: "Paldea Evolved",
    setCode: "sv2",
    number: "120",
    imageUrl: "https://images.pokemontcg.io/sv2/120.png",
    marketPrice: 6,
    rarity: "Double Rare"
  }
];
const MOCK_MTG_CARDS = [
  {
    externalId: "lci-269",
    tcg: "mtg",
    name: "The One Ring",
    setName: "The Lost Caverns of Ixalan",
    setCode: "lci",
    number: "269",
    imageUrl: "https://cards.scryfall.io/normal/front/d/5/d5806e68-1054-458e-866d-1f2470f682b2.jpg",
    marketPrice: 62,
    rarity: "Mythic"
  },
  {
    externalId: "mkm-243",
    tcg: "mtg",
    name: "Leyline of Resonance",
    setName: "Murders at Karlov Manor",
    setCode: "mkm",
    number: "243",
    imageUrl: "https://cards.scryfall.io/normal/front/9/c/9c1e67a7-5853-43e5-a953-99023b046afa.jpg",
    marketPrice: 18.5,
    rarity: "Rare"
  },
  {
    externalId: "otj-182",
    tcg: "mtg",
    name: "Jace, the Mind Sculptor",
    setName: "Outlaws of Thunder Junction",
    setCode: "otj",
    number: "182",
    imageUrl: "https://cards.scryfall.io/normal/front/c/8/c8817585-0d32-4d56-9142-0d29512e86a9.jpg",
    marketPrice: 28,
    rarity: "Mythic"
  }
];
const MOCK_YUGIOH_CARDS = [
  {
    externalId: "lede-060",
    tcg: "yugioh",
    name: "Snake-Eye Ash",
    setName: "Legacy of Destruction",
    setCode: "lede",
    number: "060",
    imageUrl: "https://images.ygoprodeck.com/images/cards_small/100421063.jpg",
    marketPrice: 22,
    rarity: "Ultra Rare"
  },
  {
    externalId: "phni-003",
    tcg: "yugioh",
    name: "Fiendsmith Engraver",
    setName: "Phantom Nightmare",
    setCode: "phni",
    number: "003",
    imageUrl: "https://images.ygoprodeck.com/images/cards_small/100421060.jpg",
    marketPrice: 15,
    rarity: "Secret Rare"
  },
  {
    externalId: "dune-050",
    tcg: "yugioh",
    name: "Blue-Eyes White Dragon",
    setName: "Duelist Nexus",
    setCode: "dune",
    number: "050",
    imageUrl: "https://images.ygoprodeck.com/images/cards_small/89631139.jpg",
    marketPrice: 8.5,
    rarity: "Ultra Rare"
  }
];
const ALL_MOCK_CARDS = {
  pokemon: MOCK_POKEMON_CARDS,
  mtg: MOCK_MTG_CARDS,
  yugioh: MOCK_YUGIOH_CARDS
};
const getMockCards = (query, tcg) => {
  const cards = ALL_MOCK_CARDS[tcg] ?? [];
  const lowerQuery = query.toLowerCase();
  return cards.filter((card) => card.name.toLowerCase().includes(lowerQuery));
};
const search = os.input(objectType({ query: stringType().min(1), tcg: TcgTypeSchema })).output(arrayType(NormalizedCardSchema)).handler(async ({ input }) => {
  return getMockCards(input.query, input.tcg);
});
const requireAuth = (context) => {
  if (!context.userId) {
    throw new Error("Authentication required");
  }
  return context;
};
const register = os.input(ShopInsertSchema.omit({ owner_id: true })).output(objectType({ shop: ShopRowSchema })).handler(async ({ input, context }) => {
  const { supabase, userId } = requireAuth(context);
  const { data, error } = await supabase.from("shops").insert({ ...input, owner_id: userId }).select().single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("You already own a shop");
    }
    throw new Error(`Failed to register shop: ${error.message}`);
  }
  if (context.adminSupabase) {
    const { error: roleError } = await context.adminSupabase.rpc("add_user_role", {
      target_user_id: userId,
      role_to_add: "shop_owner"
    });
    if (roleError) {
      console.error("[shop.register] Failed to grant shop_owner role:", roleError.message);
    }
  }
  return { shop: data };
});
const get = os.input(voidType()).output(objectType({ shop: ShopRowSchema.nullable() })).handler(async ({ context }) => {
  const { supabase, userId } = requireAuth(context);
  const { data, error } = await supabase.from("shops").select("*").eq("owner_id", userId).maybeSingle();
  if (error) {
    throw new Error(`Failed to get shop: ${error.message}`);
  }
  return { shop: data };
});
const update$1 = os.input(ShopUpdateSchema).output(objectType({ shop: ShopRowSchema })).handler(async ({ input, context }) => {
  const { supabase, userId } = requireAuth(context);
  const { data, error } = await supabase.from("shops").update(input).eq("owner_id", userId).select().single();
  if (error) {
    throw new Error(`Failed to update shop: ${error.message}`);
  }
  return { shop: data };
});
const create = os.input(ShopEventInsertSchema).output(objectType({ event: ShopEventRowSchema })).handler(async ({ input, context }) => {
  const { supabase, userId } = requireAuth(context);
  const { data: shop } = await supabase.from("shops").select("id").eq("id", input.shop_id).eq("owner_id", userId).single();
  if (!shop) {
    throw new Error("Shop not found or not owned by you");
  }
  const { data, error } = await supabase.from("shop_events").insert(input).select().single();
  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }
  return { event: data };
});
const list$1 = os.input(objectType({ shop_id: stringType().uuid() })).output(objectType({ events: arrayType(ShopEventRowSchema) })).handler(async ({ input, context }) => {
  const { supabase } = requireAuth(context);
  const { data, error } = await supabase.from("shop_events").select("*").eq("shop_id", input.shop_id).order("starts_at", { ascending: true });
  if (error) {
    throw new Error(`Failed to list events: ${error.message}`);
  }
  return { events: data ?? [] };
});
const update = os.input(objectType({ id: stringType().uuid(), status: ShopEventStatusSchema.optional() }).merge(ShopEventUpdateSchema)).output(objectType({ event: ShopEventRowSchema })).handler(async ({ input, context }) => {
  const { supabase, userId } = requireAuth(context);
  const { id, ...updates } = input;
  const { data: event } = await supabase.from("shop_events").select("shop_id").eq("id", id).single();
  if (!event) {
    throw new Error("Event not found");
  }
  const { data: shop } = await supabase.from("shops").select("id").eq("id", event.shop_id).eq("owner_id", userId).single();
  if (!shop) {
    throw new Error("Not authorized to update this event");
  }
  const { data, error } = await supabase.from("shop_events").update(updates).eq("id", id).select().single();
  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }
  return { event: data };
});
const remove = os.input(objectType({ id: stringType().uuid() })).output(objectType({ success: booleanType() })).handler(async ({ input, context }) => {
  const { supabase, userId } = requireAuth(context);
  const { data: event } = await supabase.from("shop_events").select("shop_id").eq("id", input.id).single();
  if (!event) {
    throw new Error("Event not found");
  }
  const { data: shop } = await supabase.from("shops").select("id").eq("id", event.shop_id).eq("owner_id", userId).single();
  if (!shop) {
    throw new Error("Not authorized to delete this event");
  }
  const { error } = await supabase.from("shop_events").delete().eq("id", input.id);
  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }
  return { success: true };
});
const list = os.input(objectType({
  shop_id: stringType().uuid(),
  limit: numberType().int().positive().max(100).optional()
})).output(objectType({ notifications: arrayType(ShopNotificationRowSchema) })).handler(async ({ input, context }) => {
  const { supabase } = requireAuth(context);
  const limit = input.limit ?? 50;
  const { data, error } = await supabase.from("shop_notifications").select("*").eq("shop_id", input.shop_id).order("created_at", { ascending: false }).limit(limit);
  if (error) {
    throw new Error(`Failed to list notifications: ${error.message}`);
  }
  return { notifications: data ?? [] };
});
const markRead = os.input(objectType({ ids: arrayType(stringType().uuid()).min(1) })).output(objectType({ success: booleanType() })).handler(async ({ input, context }) => {
  const { supabase } = requireAuth(context);
  const { error } = await supabase.from("shop_notifications").update({ read: true }).in("id", input.ids);
  if (error) {
    throw new Error(`Failed to mark notifications as read: ${error.message}`);
  }
  return { success: true };
});
const definePipeline = (config) => {
  const execute = async (rawInput, context) => {
    const input = config.inputSchema.parse(rawInput);
    for (const check of config.preChecks) {
      await check.run(input, context);
    }
    const params = config.rpc.mapParams(input, context);
    const { data, error } = await context.supabase.rpc(
      config.rpc.functionName,
      params
    );
    if (error) {
      throw new Error(`Pipeline "${config.name}" RPC failed: ${error.message}`);
    }
    const result = config.rpc.resultSchema.parse(data);
    for (const effect of config.postEffects) {
      try {
        await effect.run(input, result, context);
      } catch (err) {
        console.error(
          `Pipeline "${config.name}" post-effect "${effect.name}" failed:`,
          err
        );
      }
    }
    return result;
  };
  return { ...config, execute };
};
const AcceptOfferInputSchema = objectType({
  offerId: stringType().uuid(),
  listingId: stringType().uuid()
});
const AcceptOfferResultSchema = objectType({
  match_id: stringType().uuid(),
  conversation_id: stringType().uuid(),
  declined_offer_count: numberType().int()
});
const checkListingOwnership$2 = {
  name: "checkListingOwnership",
  run: async (input, ctx) => {
    const { data: listing, error } = await ctx.supabase.from("listings").select("user_id, status").eq("id", input.listingId).single();
    if (error || !listing) throw new Error("Listing not found");
    if (listing.user_id !== ctx.userId) throw new Error("Only the listing owner can accept offers");
    assertTransition("listing", listing.status, "matched");
  }
};
const checkOfferActionable$1 = {
  name: "checkOfferActionable",
  run: async (input, ctx) => {
    const { data: offer, error } = await ctx.supabase.from("offers").select("id, listing_id, status").eq("id", input.offerId).single();
    if (error || !offer) throw new Error("Offer not found");
    if (offer.listing_id !== input.listingId) throw new Error("Offer does not belong to this listing");
    assertTransition("offer", offer.status, "accepted");
  }
};
const acceptOffer = definePipeline({
  name: "acceptOffer",
  description: "Accepts an offer on a listing. Atomically: updates offer to accepted, declines all other pending/countered offers on the same listing, creates a match and conversation, updates listing to matched status.",
  inputSchema: AcceptOfferInputSchema,
  preChecks: [checkListingOwnership$2, checkOfferActionable$1],
  rpc: {
    functionName: "accept_offer_v1",
    mapParams: (input, ctx) => ({
      p_offer_id: input.offerId,
      p_listing_id: input.listingId,
      p_user_id: ctx.userId
    }),
    resultSchema: AcceptOfferResultSchema
  },
  postEffects: []
});
const acceptOfferProcedure = os.input(AcceptOfferInputSchema).output(AcceptOfferResultSchema).handler(async ({ input, context }) => {
  const authed = requireAuth(context);
  return acceptOffer.execute(input, {
    supabase: authed.supabase,
    userId: authed.userId
  });
});
const DeclineOfferInputSchema = objectType({
  offerId: stringType().uuid(),
  listingId: stringType().uuid()
});
const DeclineOfferResultSchema = objectType({
  success: booleanType()
});
const checkListingOwnership$1 = {
  name: "checkListingOwnership",
  run: async (input, ctx) => {
    const { data: listing, error } = await ctx.supabase.from("listings").select("user_id").eq("id", input.listingId).single();
    if (error || !listing) throw new Error("Listing not found");
    if (listing.user_id !== ctx.userId) throw new Error("Only the listing owner can decline offers");
  }
};
const checkOfferActionable = {
  name: "checkOfferActionable",
  run: async (input, ctx) => {
    const { data: offer, error } = await ctx.supabase.from("offers").select("id, listing_id, status").eq("id", input.offerId).single();
    if (error || !offer) throw new Error("Offer not found");
    if (offer.listing_id !== input.listingId) throw new Error("Offer does not belong to this listing");
    assertTransition("offer", offer.status, "declined");
  }
};
const declineOffer = definePipeline({
  name: "declineOffer",
  description: "Declines a single offer on a listing. Only the listing owner can decline.",
  inputSchema: DeclineOfferInputSchema,
  preChecks: [checkListingOwnership$1, checkOfferActionable],
  rpc: {
    functionName: "decline_offer_v1",
    mapParams: (input, ctx) => ({
      p_offer_id: input.offerId,
      p_user_id: ctx.userId
    }),
    resultSchema: DeclineOfferResultSchema
  },
  postEffects: []
});
const declineOfferProcedure = os.input(DeclineOfferInputSchema).output(DeclineOfferResultSchema).handler(async ({ input, context }) => {
  const authed = requireAuth(context);
  return declineOffer.execute(input, {
    supabase: authed.supabase,
    userId: authed.userId
  });
});
const CompleteMeetupInputSchema = objectType({
  meetupId: stringType().uuid()
});
const CompleteMeetupResultSchema = objectType({
  meetup_id: stringType().uuid(),
  both_completed: booleanType()
});
const checkMeetupParticipant = {
  name: "checkMeetupParticipant",
  run: async (input, ctx) => {
    const { data: meetup, error } = await ctx.supabase.from("meetups").select("id, status, match_id").eq("id", input.meetupId).single();
    if (error || !meetup) throw new Error("Meetup not found");
    if (meetup.status !== "confirmed") throw new Error(`Meetup is not in confirmed state (current: ${meetup.status})`);
    const { data: match, error: matchError } = await ctx.supabase.from("matches").select("user_a_id, user_b_id").eq("id", meetup.match_id).single();
    if (matchError || !match) throw new Error("Match not found for meetup");
    if (match.user_a_id !== ctx.userId && match.user_b_id !== ctx.userId) {
      throw new Error("Not a participant in this meetup");
    }
  }
};
const completeMeetup = definePipeline({
  name: "completeMeetup",
  description: "Marks the current user as completed on a meetup. If both parties have completed, atomically finalizes the meetup and match, and increments both users total_trades.",
  inputSchema: CompleteMeetupInputSchema,
  preChecks: [checkMeetupParticipant],
  rpc: {
    functionName: "complete_meetup_v1",
    mapParams: (input, ctx) => ({
      p_meetup_id: input.meetupId,
      p_user_id: ctx.userId
    }),
    resultSchema: CompleteMeetupResultSchema
  },
  postEffects: []
});
const completeMeetupProcedure = os.input(CompleteMeetupInputSchema).output(CompleteMeetupResultSchema).handler(async ({ input, context }) => {
  const authed = requireAuth(context);
  return completeMeetup.execute(input, {
    supabase: authed.supabase,
    userId: authed.userId
  });
});
const ExpireListingInputSchema = objectType({
  listingId: stringType().uuid()
});
const ExpireListingResultSchema = objectType({
  success: booleanType(),
  withdrawn_offer_count: numberType().int()
});
const checkListingOwnership = {
  name: "checkListingOwnership",
  run: async (input, ctx) => {
    const { data: listing, error } = await ctx.supabase.from("listings").select("user_id, status").eq("id", input.listingId).single();
    if (error || !listing) throw new Error("Listing not found");
    if (listing.user_id !== ctx.userId) throw new Error("Only the listing owner can expire a listing");
    assertTransition("listing", listing.status, "expired");
  }
};
const expireListing = definePipeline({
  name: "expireListing",
  description: "Soft-deletes a listing by transitioning to expired status. Atomically withdraws any pending/countered offers on the listing.",
  inputSchema: ExpireListingInputSchema,
  preChecks: [checkListingOwnership],
  rpc: {
    functionName: "expire_listing_v1",
    mapParams: (input, ctx) => ({
      p_listing_id: input.listingId,
      p_user_id: ctx.userId
    }),
    resultSchema: ExpireListingResultSchema
  },
  postEffects: []
});
const expireListingProcedure = os.input(ExpireListingInputSchema).output(ExpireListingResultSchema).handler(async ({ input, context }) => {
  const authed = requireAuth(context);
  return expireListing.execute(input, {
    supabase: authed.supabase,
    userId: authed.userId
  });
});
const OfferItemSchema = objectType({
  card_name: stringType(),
  card_image_url: stringType(),
  card_external_id: stringType(),
  tcg: stringType(),
  card_set: stringType().nullable(),
  card_number: stringType().nullable(),
  condition: stringType(),
  market_price: numberType().nullable(),
  quantity: numberType().int().positive().default(1)
});
const CreateOfferInputSchema = objectType({
  listingId: stringType().uuid(),
  cashAmount: numberType().min(0),
  offeringNote: stringType().nullable(),
  items: arrayType(OfferItemSchema)
});
const CreateOfferResultSchema = objectType({
  offer_id: stringType().uuid()
});
const checkListingActive = {
  name: "checkListingActive",
  run: async (input, ctx) => {
    const { data: listing, error } = await ctx.supabase.from("listings").select("user_id, status").eq("id", input.listingId).single();
    if (error || !listing) throw new Error("Listing not found");
    if (listing.status !== "active") throw new Error(`Listing is not active (current: ${listing.status})`);
    if (listing.user_id === ctx.userId) throw new Error("Cannot offer on your own listing");
  }
};
const createOffer = definePipeline({
  name: "createOffer",
  description: "Creates an offer on a listing with optional card items, atomically. Validates listing is active and offerer is not the listing owner.",
  inputSchema: CreateOfferInputSchema,
  preChecks: [checkListingActive],
  rpc: {
    functionName: "create_offer_v1",
    mapParams: (input, ctx) => ({
      p_listing_id: input.listingId,
      p_offerer_id: ctx.userId,
      p_cash_amount: input.cashAmount,
      p_offerer_note: input.offeringNote,
      p_items: JSON.stringify(input.items)
    }),
    resultSchema: CreateOfferResultSchema
  },
  postEffects: []
});
const createOfferProcedure = os.input(CreateOfferInputSchema).output(CreateOfferResultSchema).handler(async ({ input, context }) => {
  const authed = requireAuth(context);
  return createOffer.execute(input, {
    supabase: authed.supabase,
    userId: authed.userId
  });
});
const router = {
  preRegistration: { create: create$1 },
  card: { search },
  shop: {
    register,
    get,
    update: update$1,
    events: {
      create,
      list: list$1,
      update,
      remove
    },
    notifications: {
      list,
      markRead
    }
  },
  pipeline: {
    acceptOffer: acceptOfferProcedure,
    declineOffer: declineOfferProcedure,
    completeMeetup: completeMeetupProcedure,
    expireListing: expireListingProcedure,
    createOffer: createOfferProcedure
  }
};
const serverEnvSchema = objectType({
  SUPABASE_URL: stringType().url(),
  SUPABASE_SERVICE_ROLE_KEY: stringType().min(1)
});
const getServerEnv = () => {
  return serverEnvSchema.parse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  });
};
const createSupabaseServiceClient = () => {
  const env = getServerEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};
const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error("[oRPC Error]", error);
    })
  ]
});
const handleRPC = async (request) => {
  const supabase = createSupabaseServiceClient();
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: { supabase }
  });
  return response ?? new Response("Not Found", { status: 404 });
};
export {
  handleRPC
};
