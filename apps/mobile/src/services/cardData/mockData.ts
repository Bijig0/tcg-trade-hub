import type { NormalizedCard } from '@tcg-trade-hub/database';
import type { CardDetail, SetInfo } from './types';

/** Hardcoded Pokemon cards for development/demo purposes. */
export const MOCK_POKEMON_CARDS: NormalizedCard[] = [
  {
    externalId: 'sv3pt5-7',
    tcg: 'pokemon',
    name: 'Charizard ex',
    setName: '151',
    setCode: 'sv3pt5',
    number: '6',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/6.png',
    marketPrice: 42.5,
    rarity: 'Double Rare',
  },
  {
    externalId: 'sv3pt5-199',
    tcg: 'pokemon',
    name: 'Charizard ex',
    setName: '151',
    setCode: 'sv3pt5',
    number: '199',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/199.png',
    marketPrice: 185.0,
    rarity: 'Special Art Rare',
  },
  {
    externalId: 'sv4-18',
    tcg: 'pokemon',
    name: 'Arcanine ex',
    setName: 'Paradox Rift',
    setCode: 'sv4',
    number: '18',
    imageUrl: 'https://images.pokemontcg.io/sv4/18.png',
    marketPrice: 3.25,
    rarity: 'Double Rare',
  },
  {
    externalId: 'sv3-99',
    tcg: 'pokemon',
    name: 'Umbreon ex',
    setName: 'Obsidian Flames',
    setCode: 'sv3',
    number: '99',
    imageUrl: 'https://images.pokemontcg.io/sv3/99.png',
    marketPrice: 12.75,
    rarity: 'Double Rare',
  },
  {
    externalId: 'sv3-228',
    tcg: 'pokemon',
    name: 'Umbreon ex',
    setName: 'Obsidian Flames',
    setCode: 'sv3',
    number: '228',
    imageUrl: 'https://images.pokemontcg.io/sv3/228.png',
    marketPrice: 95.0,
    rarity: 'Special Art Rare',
  },
  {
    externalId: 'sv2-91',
    tcg: 'pokemon',
    name: 'Pikachu ex',
    setName: 'Paldea Evolved',
    setCode: 'sv2',
    number: '91',
    imageUrl: 'https://images.pokemontcg.io/sv2/91.png',
    marketPrice: 5.5,
    rarity: 'Double Rare',
  },
  {
    externalId: 'sv1-254',
    tcg: 'pokemon',
    name: 'Miraidon ex',
    setName: 'Scarlet & Violet',
    setCode: 'sv1',
    number: '254',
    imageUrl: 'https://images.pokemontcg.io/sv1/254.png',
    marketPrice: 22.0,
    rarity: 'Special Art Rare',
  },
  {
    externalId: 'sv3pt5-172',
    tcg: 'pokemon',
    name: 'Mew ex',
    setName: '151',
    setCode: 'sv3pt5',
    number: '172',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/172.png',
    marketPrice: 35.0,
    rarity: 'Ultra Rare',
  },
  {
    externalId: 'sv4-228',
    tcg: 'pokemon',
    name: 'Roaring Moon ex',
    setName: 'Paradox Rift',
    setCode: 'sv4',
    number: '228',
    imageUrl: 'https://images.pokemontcg.io/sv4/228.png',
    marketPrice: 55.0,
    rarity: 'Special Art Rare',
  },
  {
    externalId: 'sv3-197',
    tcg: 'pokemon',
    name: 'Charizard ex',
    setName: 'Obsidian Flames',
    setCode: 'sv3',
    number: '197',
    imageUrl: 'https://images.pokemontcg.io/sv3/197.png',
    marketPrice: 120.0,
    rarity: 'Special Art Rare',
  },
  {
    externalId: 'sv2-230',
    tcg: 'pokemon',
    name: 'Iono',
    setName: 'Paldea Evolved',
    setCode: 'sv2',
    number: '230',
    imageUrl: 'https://images.pokemontcg.io/sv2/230.png',
    marketPrice: 65.0,
    rarity: 'Special Art Rare',
  },
  {
    externalId: 'sv1-198',
    tcg: 'pokemon',
    name: 'Gardevoir ex',
    setName: 'Scarlet & Violet',
    setCode: 'sv1',
    number: '198',
    imageUrl: 'https://images.pokemontcg.io/sv1/198.png',
    marketPrice: 15.5,
    rarity: 'Ultra Rare',
  },
  {
    externalId: 'sv4-139',
    tcg: 'pokemon',
    name: 'Iron Valiant ex',
    setName: 'Paradox Rift',
    setCode: 'sv4',
    number: '139',
    imageUrl: 'https://images.pokemontcg.io/sv4/139.png',
    marketPrice: 4.0,
    rarity: 'Double Rare',
  },
  {
    externalId: 'sv3pt5-25',
    tcg: 'pokemon',
    name: 'Pikachu',
    setName: '151',
    setCode: 'sv3pt5',
    number: '25',
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/25.png',
    marketPrice: 1.25,
    rarity: 'Common',
  },
  {
    externalId: 'sv2-120',
    tcg: 'pokemon',
    name: 'Mewtwo ex',
    setName: 'Paldea Evolved',
    setCode: 'sv2',
    number: '120',
    imageUrl: 'https://images.pokemontcg.io/sv2/120.png',
    marketPrice: 6.0,
    rarity: 'Double Rare',
  },
];

/** Hardcoded MTG cards for development/demo purposes. */
export const MOCK_MTG_CARDS: NormalizedCard[] = [
  {
    externalId: 'lci-269',
    tcg: 'mtg',
    name: 'The One Ring',
    setName: 'The Lost Caverns of Ixalan',
    setCode: 'lci',
    number: '269',
    imageUrl: 'https://cards.scryfall.io/normal/front/d/5/d5806e68-1054-458e-866d-1f2470f682b2.jpg',
    marketPrice: 62.0,
    rarity: 'Mythic',
  },
  {
    externalId: 'mkm-243',
    tcg: 'mtg',
    name: 'Leyline of Resonance',
    setName: 'Murders at Karlov Manor',
    setCode: 'mkm',
    number: '243',
    imageUrl: 'https://cards.scryfall.io/normal/front/9/c/9c1e67a7-5853-43e5-a953-99023b046afa.jpg',
    marketPrice: 18.5,
    rarity: 'Rare',
  },
  {
    externalId: 'otj-182',
    tcg: 'mtg',
    name: 'Jace, the Mind Sculptor',
    setName: 'Outlaws of Thunder Junction',
    setCode: 'otj',
    number: '182',
    imageUrl: 'https://cards.scryfall.io/normal/front/c/8/c8817585-0d32-4d56-9142-0d29512e86a9.jpg',
    marketPrice: 28.0,
    rarity: 'Mythic',
  },
];

/** Hardcoded Yu-Gi-Oh! cards for development/demo purposes. */
export const MOCK_YUGIOH_CARDS: NormalizedCard[] = [
  {
    externalId: 'lede-060',
    tcg: 'yugioh',
    name: 'Snake-Eye Ash',
    setName: 'Legacy of Destruction',
    setCode: 'lede',
    number: '060',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_small/100421063.jpg',
    marketPrice: 22.0,
    rarity: 'Ultra Rare',
  },
  {
    externalId: 'phni-003',
    tcg: 'yugioh',
    name: 'Fiendsmith Engraver',
    setName: 'Phantom Nightmare',
    setCode: 'phni',
    number: '003',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_small/100421060.jpg',
    marketPrice: 15.0,
    rarity: 'Secret Rare',
  },
  {
    externalId: 'dune-050',
    tcg: 'yugioh',
    name: 'Blue-Eyes White Dragon',
    setName: 'Duelist Nexus',
    setCode: 'dune',
    number: '050',
    imageUrl: 'https://images.ygoprodeck.com/images/cards_small/89631139.jpg',
    marketPrice: 8.5,
    rarity: 'Ultra Rare',
  },
];

const ALL_MOCK_CARDS: Record<string, NormalizedCard[]> = {
  pokemon: MOCK_POKEMON_CARDS,
  mtg: MOCK_MTG_CARDS,
  yugioh: MOCK_YUGIOH_CARDS,
};

/** Hardcoded sets for development/demo purposes. */
export const MOCK_POKEMON_SETS: SetInfo[] = [
  { id: 'sv3pt5', name: '151', code: 'sv3pt5', releaseDate: '2023-09-22', totalCards: 207, logoUrl: null },
  { id: 'sv4', name: 'Paradox Rift', code: 'sv4', releaseDate: '2023-11-03', totalCards: 266, logoUrl: null },
  { id: 'sv3', name: 'Obsidian Flames', code: 'sv3', releaseDate: '2023-08-11', totalCards: 230, logoUrl: null },
  { id: 'sv2', name: 'Paldea Evolved', code: 'sv2', releaseDate: '2023-06-09', totalCards: 279, logoUrl: null },
  { id: 'sv1', name: 'Scarlet & Violet', code: 'sv1', releaseDate: '2023-03-31', totalCards: 258, logoUrl: null },
];

/**
 * Returns mock cards matching query for the given TCG, optionally filtered by set.
 * Simulates the behavior a real adapter (e.g. Scrydex) would have.
 */
export const getMockCards = (
  query: string,
  tcg: string,
  setCode?: string,
): NormalizedCard[] => {
  const cards = ALL_MOCK_CARDS[tcg] ?? [];
  const lowerQuery = query.toLowerCase();

  return cards.filter((card) => {
    const matchesQuery = card.name.toLowerCase().includes(lowerQuery);
    const matchesSet = setCode ? card.setCode === setCode : true;
    return matchesQuery && matchesSet;
  });
};

/**
 * Returns mock card detail for a given externalId.
 */
export const getMockCardDetail = (externalId: string): CardDetail | null => {
  const allCards = [
    ...MOCK_POKEMON_CARDS,
    ...MOCK_MTG_CARDS,
    ...MOCK_YUGIOH_CARDS,
  ];
  const card = allCards.find((c) => c.externalId === externalId);
  if (!card) return null;

  return {
    ...card,
    largeImageUrl: card.imageUrl.replace('_small', '').replace('.png', '_hires.png'),
    artist: 'Mock Artist',
    types: card.tcg === 'pokemon' ? ['Fire'] : [],
    hp: card.tcg === 'pokemon' ? '330' : null,
    prices: {
      variants: {
        normal: {
          low: (card.marketPrice ?? 0) * 0.8,
          mid: card.marketPrice,
          high: (card.marketPrice ?? 0) * 1.3,
          market: card.marketPrice,
        },
        holofoil: {
          low: (card.marketPrice ?? 0) * 1.1,
          mid: (card.marketPrice ?? 0) * 1.4,
          high: (card.marketPrice ?? 0) * 2.0,
          market: (card.marketPrice ?? 0) * 1.4,
        },
      },
      averageSellPrice: card.marketPrice,
      trendPrice: card.marketPrice ? card.marketPrice * 1.05 : null,
    },
  };
};

/**
 * Returns mock sets matching query for the given TCG.
 */
export const getMockSets = (query: string, _tcg: string): SetInfo[] => {
  const lowerQuery = query.toLowerCase();
  return MOCK_POKEMON_SETS.filter((set) =>
    set.name.toLowerCase().includes(lowerQuery),
  );
};
