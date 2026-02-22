import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import type { RelevantListing, RelevantShop } from '../../schemas';
import type { ListingWithDistance } from '@/features/feed/schemas';
import type { ListingType, ListingStatus, CardCondition, TcgType } from '@tcg-trade-hub/database';

type RelevantListingsResponse = {
  listings: RelevantListing[];
  shops: RelevantShop[];
};

/**
 * Generates demo data for the owner listing detail screen.
 * Scatters traders and shops around the user's location (SF area)
 * with realistic card names, prices, and ratings.
 */
const buildDemoData = (listing: ListingWithDistance | undefined): RelevantListingsResponse => {
  // Center near SF — offset slightly from the default map center
  const baseLat = 37.7749;
  const baseLng = -122.4194;

  const traderNames = [
    'Alex T.', 'Jordan K.', 'Sam W.', 'Casey R.', 'Morgan P.',
    'Riley D.', 'Taylor B.', 'Quinn L.', 'Jamie H.', 'Drew M.',
    'Avery C.', 'Blake N.',
  ];

  const pokemonCards = [
    { name: 'Charizard VMAX', set: 'Shining Fates', number: '079', price: 89.99, rarity: 'Secret Rare' },
    { name: 'Pikachu VMAX', set: 'Vivid Voltage', number: '044', price: 24.50, rarity: 'Ultra Rare' },
    { name: 'Mewtwo V', set: 'Pokémon GO', number: '072', price: 12.99, rarity: 'Ultra Rare' },
    { name: 'Umbreon VMAX', set: 'Evolving Skies', number: '215', price: 145.00, rarity: 'Alternate Art' },
    { name: 'Lugia V', set: 'Silver Tempest', number: '186', price: 32.00, rarity: 'Ultra Rare' },
    { name: 'Rayquaza VMAX', set: 'Evolving Skies', number: '218', price: 198.00, rarity: 'Alternate Art' },
    { name: 'Gengar VMAX', set: 'Fusion Strike', number: '271', price: 55.00, rarity: 'Alternate Art' },
    { name: 'Arceus VSTAR', set: 'Brilliant Stars', number: '123', price: 18.50, rarity: 'Ultra Rare' },
    { name: 'Giratina VSTAR', set: 'Lost Origin', number: '131', price: 28.00, rarity: 'Ultra Rare' },
    { name: 'Mew VMAX', set: 'Fusion Strike', number: '269', price: 42.00, rarity: 'Alternate Art' },
    { name: 'Espeon VMAX', set: 'Evolving Skies', number: '270', price: 78.00, rarity: 'Alternate Art' },
    { name: 'Palkia VSTAR', set: 'Astral Radiance', number: '195', price: 22.00, rarity: 'Ultra Rare' },
  ];

  const conditions: CardCondition[] = ['nm', 'lp', 'mp'];
  const complementType: ListingType = listing?.type === 'wts' ? 'wtb' : listing?.type === 'wtb' ? 'wts' : 'wtt';
  const tcg: TcgType = (listing?.tcg as TcgType) ?? 'pokemon';
  const status: ListingStatus = 'active';

  const listings: RelevantListing[] = pokemonCards.map((card, i) => {
    // Scatter traders in a ~5km radius around SF center
    const angle = (i / pokemonCards.length) * 2 * Math.PI;
    const radius = 0.01 + Math.random() * 0.025;
    const lat = baseLat + Math.cos(angle) * radius;
    const lng = baseLng + Math.sin(angle) * radius;
    const distKm = Math.round((radius / 0.009) * 10) / 10; // rough km conversion

    return {
      id: `demo-${i}`,
      user_id: `demo-user-${i}`,
      type: complementType,
      tcg,
      card_name: card.name,
      card_set: card.set,
      card_number: card.number,
      card_external_id: `demo-ext-${i}`,
      card_image_url: `https://images.pokemontcg.io/swsh45/${String(i + 1).padStart(3, '0')}_hires.png`,
      card_rarity: card.rarity,
      card_market_price: card.price,
      condition: conditions[i % conditions.length] ?? 'nm',
      asking_price: card.price,
      description: null,
      photos: [],
      trade_wants: null,
      status,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      updated_at: new Date(Date.now() - i * 3600000).toISOString(),
      owner: {
        id: `demo-user-${i}`,
        display_name: traderNames[i],
        avatar_url: null,
        rating_score: 3.5 + Math.round(Math.random() * 15) / 10,
        total_trades: 5 + Math.floor(Math.random() * 80),
        approximate_lat: lat,
        approximate_lng: lng,
      },
      relevance_score: 10 - i,
      distance_km: distKm,
    };
  });

  const shops: RelevantShop[] = [
    {
      id: 'shop-1',
      name: 'Gamescape',
      address: '333 Divisadero St, San Francisco',
      lat: baseLat + 0.008,
      lng: baseLng - 0.012,
      supported_tcgs: ['pokemon', 'mtg', 'yugioh'],
      verified: true,
    },
    {
      id: 'shop-2',
      name: 'Cards & Comics Central',
      address: '5424 Geary Blvd, San Francisco',
      lat: baseLat + 0.003,
      lng: baseLng - 0.035,
      supported_tcgs: ['pokemon', 'mtg'],
      verified: true,
    },
    {
      id: 'shop-3',
      name: 'Versus Games',
      address: '393 18th St, San Francisco',
      lat: baseLat - 0.012,
      lng: baseLng + 0.005,
      supported_tcgs: ['pokemon', 'yugioh'],
      verified: false,
    },
  ];

  return { listings, shops };
};

/**
 * Hook that fetches relevant complement listings and nearby shops
 * for an owner's listing via the get-relevant-listings Edge Function.
 *
 * Falls back to demo data when the edge function is unavailable,
 * so the screen always looks populated for demos.
 */
const useRelevantListings = (listingId: string, listing?: ListingWithDistance) => {
  return useQuery<RelevantListingsResponse, Error>({
    queryKey: listingKeys.relevantListings(listingId),
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const response = await supabase.functions.invoke('get-relevant-listings', {
          body: { listing_id: listingId },
        });

        if (response.error) throw new Error(response.error.message);

        const data = response.data as RelevantListingsResponse;
        // If the real endpoint returns results, use them
        if (data.listings.length > 0) return data;
      } catch {
        // Edge function not deployed yet — expected during development
      }

      // Fall back to demo data
      return buildDemoData(listing);
    },
    enabled: !!listingId,
  });
};

export default useRelevantListings;
