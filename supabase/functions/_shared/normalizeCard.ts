/**
 * Card normalization functions.
 * Transforms responses from Pokemon TCG API, Scryfall (MTG), and YGOProDeck
 * into a unified NormalizedCard shape.
 */

export type NormalizedCard = {
  externalId: string;
  tcg: 'pokemon' | 'mtg' | 'yugioh';
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
    imageUrl: card.images.large || card.images.small,
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
    return card.image_uris.large || card.image_uris.normal || card.image_uris.small || '';
  }
  // Double-faced cards store images per face
  if (card.card_faces && card.card_faces.length > 0) {
    const face = card.card_faces[0];
    if (face.image_uris) {
      return face.image_uris.large || face.image_uris.normal || face.image_uris.small || '';
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
// YGOProDeck API (https://db.ygoprodeck.com/api/v7)
// ---------------------------------------------------------------------------

interface YugiohCard {
  id: number;
  name: string;
  card_sets?: Array<{
    set_name: string;
    set_code: string;
    set_rarity: string;
    set_price: string;
  }>;
  card_images: Array<{
    id: number;
    image_url: string;
    image_url_small: string;
    image_url_cropped: string;
  }>;
  card_prices: Array<{
    cardmarket_price: string;
    tcgplayer_price: string;
    ebay_price: string;
    amazon_price: string;
    coolstuffinc_price: string;
  }>;
}

export function normalizeYugiohCard(card: YugiohCard): NormalizedCard {
  const firstSet = card.card_sets?.[0];
  const firstImage = card.card_images?.[0];
  const firstPrice = card.card_prices?.[0];

  let marketPrice: number | null = null;
  if (firstPrice) {
    const tcgPrice = parseFloat(firstPrice.tcgplayer_price);
    const cmPrice = parseFloat(firstPrice.cardmarket_price);
    if (!isNaN(tcgPrice) && tcgPrice > 0) {
      marketPrice = tcgPrice;
    } else if (!isNaN(cmPrice) && cmPrice > 0) {
      marketPrice = cmPrice;
    }
  }

  return {
    externalId: String(card.id),
    tcg: 'yugioh',
    name: card.name,
    setName: firstSet?.set_name ?? 'Unknown Set',
    setCode: firstSet?.set_code?.split('-')[0] ?? 'N/A',
    number: firstSet?.set_code ?? String(card.id),
    imageUrl: firstImage?.image_url ?? '',
    marketPrice,
    rarity: firstSet?.set_rarity ?? 'Unknown',
  };
}
