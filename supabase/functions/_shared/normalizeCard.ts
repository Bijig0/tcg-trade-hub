/**
 * Card normalization functions.
 * Transforms responses from Pokemon TCG API, Scryfall (MTG), and YGOProDeck
 * into a unified NormalizedCard shape.
 */

export type NormalizedCard = {
  externalId: string;
  tcg: 'pokemon' | 'mtg' | 'onepiece';
  name: string;
  setName: string;
  setCode: string;
  number: string;
  imageUrl: string;
  marketPrice: number | null;
  rarity: string;
};

// ---------------------------------------------------------------------------
// Pokemon TCG API (https://api.pokemontcg.io/v2)
// ---------------------------------------------------------------------------

interface PokemonCard {
  id: string;
  name: string;
  set: {
    name: string;
    id: string;
  };
  number: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    prices?: {
      holofoil?: { market?: number };
      reverseHolofoil?: { market?: number };
      normal?: { market?: number };
      [key: string]: { market?: number } | undefined;
    };
  };
  cardmarket?: {
    prices?: {
      averageSellPrice?: number;
    };
  };
  rarity?: string;
}

function extractPokemonPrice(card: PokemonCard): number | null {
  const prices = card.tcgplayer?.prices;
  if (prices) {
    // Try common price categories in order of preference
    for (const category of ['holofoil', 'reverseHolofoil', 'normal']) {
      const market = prices[category]?.market;
      if (typeof market === 'number') return market;
    }
    // Fall back to any available price
    for (const key of Object.keys(prices)) {
      const market = prices[key]?.market;
      if (typeof market === 'number') return market;
    }
  }
  return card.cardmarket?.prices?.averageSellPrice ?? null;
}

export function normalizePokemonCard(card: PokemonCard): NormalizedCard {
  return {
    externalId: card.id,
    tcg: 'pokemon',
    name: card.name,
    setName: card.set.name,
    setCode: card.set.id,
    number: card.number,
    imageUrl: card.images.small || card.images.large,
    marketPrice: extractPokemonPrice(card),
    rarity: card.rarity ?? 'Unknown',
  };
}

// ---------------------------------------------------------------------------
// Scryfall MTG API (https://api.scryfall.com)
// ---------------------------------------------------------------------------

interface ScryfallCard {
  id: string;
  name: string;
  set_name: string;
  set: string;
  collector_number: string;
  image_uris?: {
    normal?: string;
    large?: string;
    small?: string;
    png?: string;
  };
  card_faces?: Array<{
    image_uris?: {
      normal?: string;
      large?: string;
      small?: string;
    };
  }>;
  prices: {
    usd?: string | null;
    usd_foil?: string | null;
    eur?: string | null;
  };
  rarity: string;
}

function extractScryfallImage(card: ScryfallCard): string {
  if (card.image_uris) {
    return card.image_uris.normal || card.image_uris.small || card.image_uris.large || '';
  }
  // Double-faced cards store images per face
  if (card.card_faces && card.card_faces.length > 0) {
    const face = card.card_faces[0];
    if (face.image_uris) {
      return face.image_uris.normal || face.image_uris.small || face.image_uris.large || '';
    }
  }
  return '';
}

export function normalizeMtgCard(card: ScryfallCard): NormalizedCard {
  const priceStr = card.prices.usd ?? card.prices.usd_foil ?? card.prices.eur ?? null;
  return {
    externalId: card.id,
    tcg: 'mtg',
    name: card.name,
    setName: card.set_name,
    setCode: card.set.toUpperCase(),
    number: card.collector_number,
    imageUrl: extractScryfallImage(card),
    marketPrice: priceStr ? parseFloat(priceStr) : null,
    rarity: card.rarity ?? 'Unknown',
  };
}

// ---------------------------------------------------------------------------
// Scrydex One Piece API (https://api.scrydex.com/onepiece/v1)
// ---------------------------------------------------------------------------

interface OnePieceCard {
  id: string;
  name: string;
  number: string;
  rarity: string;
  images?: Array<{
    small?: string;
    medium?: string;
    large?: string;
  }>;
  expansion?: {
    name: string;
    code: string;
  };
  prices?: Array<{
    variant: string;
    market?: number;
  }>;
}

export function normalizeOnePieceCard(card: OnePieceCard): NormalizedCard {
  const image = card.images?.[0];
  const price = card.prices?.find((p) => p.variant === 'normal') ?? card.prices?.[0];

  return {
    externalId: card.id,
    tcg: 'onepiece',
    name: card.name,
    setName: card.expansion?.name ?? 'Unknown Set',
    setCode: card.expansion?.code ?? 'N/A',
    number: card.number ?? card.id,
    imageUrl: image?.medium ?? image?.small ?? '',
    marketPrice: price?.market ?? null,
    rarity: card.rarity ?? 'Unknown',
  };
}
