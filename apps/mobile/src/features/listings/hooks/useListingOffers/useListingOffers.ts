import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listingKeys } from '../../queryKeys';
import type { OfferWithItems, RelevantShop } from '../../schemas';
import type { OfferRow, OfferItemRow, OfferStatus } from '@tcg-trade-hub/database';

type ListingOffersResponse = {
  offers: OfferWithItems[];
  shops: RelevantShop[];
};

const DEMO_OFFERERS = [
  { id: 'demo-offerer-1', display_name: 'Alex T.', avatar_url: null, rating_score: 4.8, total_trades: 42 },
  { id: 'demo-offerer-2', display_name: 'Jordan K.', avatar_url: null, rating_score: 4.5, total_trades: 28 },
  { id: 'demo-offerer-3', display_name: 'Sam W.', avatar_url: null, rating_score: 4.2, total_trades: 15 },
  { id: 'demo-offerer-4', display_name: 'Casey R.', avatar_url: null, rating_score: 4.9, total_trades: 67 },
  { id: 'demo-offerer-5', display_name: 'Morgan P.', avatar_url: null, rating_score: 3.8, total_trades: 8 },
];

const DEMO_CARDS = [
  { name: 'Pikachu VMAX', set: 'Vivid Voltage', number: '044', price: 24.50 },
  { name: 'Mewtwo V', set: 'Pokemon GO', number: '072', price: 12.99 },
  { name: 'Umbreon VMAX', set: 'Evolving Skies', number: '215', price: 145.00 },
  { name: 'Lugia V', set: 'Silver Tempest', number: '186', price: 32.00 },
  { name: 'Gengar VMAX', set: 'Fusion Strike', number: '271', price: 55.00 },
];

const buildDemoOffers = (): ListingOffersResponse => {
  const statuses: OfferStatus[] = ['pending', 'pending', 'pending', 'pending', 'accepted'];

  const offers: OfferWithItems[] = DEMO_OFFERERS.map((offerer, i) => {
    const cardCount = 1 + (i % 3);
    const items: OfferItemRow[] = DEMO_CARDS.slice(0, cardCount).map((card, j) => ({
      id: `demo-offer-item-${i}-${j}`,
      offer_id: `demo-offer-${i}`,
      collection_item_id: null,
      card_name: card.name,
      card_image_url: `https://images.pokemontcg.io/swsh45/${String(j + 1).padStart(3, '0')}_hires.png`,
      card_external_id: `demo-ext-offer-${i}-${j}`,
      tcg: 'pokemon' as const,
      card_set: card.set,
      card_number: card.number,
      condition: 'nm' as const,
      market_price: card.price,
      quantity: 1,
      created_at: new Date().toISOString(),
    }));

    const cashAmount = i % 2 === 0 ? 25 + i * 15 : 0;

    return {
      id: `demo-offer-${i}`,
      listing_id: 'demo-listing',
      offerer_id: offerer.id,
      status: statuses[i] ?? 'pending',
      cash_amount: cashAmount,
      message: i === 0 ? 'Really interested in this card!' : null,
      parent_offer_id: null,
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      updated_at: new Date(Date.now() - i * 3600000).toISOString(),
      items,
      offerer,
    };
  });

  const shops: RelevantShop[] = [
    {
      id: 'shop-1',
      name: 'Gamescape',
      address: '333 Divisadero St, San Francisco',
      lat: 37.7749 + 0.008,
      lng: -122.4194 - 0.012,
      supported_tcgs: ['pokemon', 'mtg', 'onepiece'],
      verified: true,
    },
    {
      id: 'shop-2',
      name: 'Cards & Comics Central',
      address: '5424 Geary Blvd, San Francisco',
      lat: 37.7749 + 0.003,
      lng: -122.4194 - 0.035,
      supported_tcgs: ['pokemon', 'mtg'],
      verified: true,
    },
  ];

  return { offers, shops };
};

/**
 * Fetches offers for a listing with offerer profiles and items.
 * Falls back to demo data when the real data is unavailable.
 */
const useListingOffers = (listingId: string) => {
  return useQuery<ListingOffersResponse, Error>({
    queryKey: listingKeys.offers(listingId),
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        // Fetch offers
        const { data: offers, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .eq('listing_id', listingId)
          .order('created_at', { ascending: false });

        if (offersError) throw offersError;
        if (!offers || offers.length === 0) throw new Error('No offers');

        const offerRows = offers as OfferRow[];
        const offerIds = offerRows.map((o) => o.id);

        // Fetch offer items
        const { data: allItems, error: itemsError } = await supabase
          .from('offer_items')
          .select('*')
          .in('offer_id', offerIds);

        if (itemsError) throw itemsError;

        const itemsByOffer = new Map<string, OfferItemRow[]>();
        for (const item of (allItems ?? []) as OfferItemRow[]) {
          const existing = itemsByOffer.get(item.offer_id) ?? [];
          existing.push(item);
          itemsByOffer.set(item.offer_id, existing);
        }

        // Fetch offerer profiles
        const offererIds = [...new Set(offerRows.map((o) => o.offerer_id))];
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, display_name, avatar_url, rating_score, total_trades')
          .in('id', offererIds);

        if (usersError) throw usersError;

        const userMap = new Map<string, OfferWithItems['offerer']>();
        for (const u of users ?? []) {
          userMap.set(u.id, {
            id: u.id,
            display_name: u.display_name,
            avatar_url: u.avatar_url,
            rating_score: u.rating_score,
            total_trades: u.total_trades,
          });
        }

        const enrichedOffers: OfferWithItems[] = offerRows.map((offer) => ({
          ...offer,
          items: itemsByOffer.get(offer.id) ?? [],
          offerer: userMap.get(offer.offerer_id) ?? {
            id: offer.offerer_id,
            display_name: 'Unknown',
            avatar_url: null,
            rating_score: 0,
            total_trades: 0,
          },
        }));

        return { offers: enrichedOffers, shops: [] };
      } catch {
        // Fall back to demo data
        return buildDemoOffers();
      }
    },
    enabled: !!listingId,
  });
};

export default useListingOffers;
