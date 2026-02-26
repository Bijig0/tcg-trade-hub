import type { CardRef, CollectionItemRow } from '@tcg-trade-hub/database';
import type { TradeContextItem } from '../../hooks/useTradeContext/useTradeContext';

/** Converts a TradeContextItem to a CardRef for use in message payloads */
export const toCardRef = (item: TradeContextItem): CardRef => ({
  externalId: item.cardExternalId,
  tcg: item.tcg,
  name: item.cardName,
  imageUrl: item.cardImageUrl,
  condition: item.condition as CardRef['condition'],
  quantity: item.quantity,
});

/** Converts a CardRef back to a TradeContextItem for display (marketPrice = null) */
export const fromCardRef = (ref: CardRef): TradeContextItem => ({
  cardName: ref.name,
  cardImageUrl: ref.imageUrl,
  cardExternalId: ref.externalId,
  tcg: ref.tcg,
  condition: (ref.condition as string) ?? 'nm',
  quantity: ref.quantity ?? 1,
  marketPrice: null,
});

/** Converts a collection item from the picker to a TradeContextItem for display */
export const collectionItemToTradeItem = (item: CollectionItemRow): TradeContextItem => ({
  cardName: item.card_name,
  cardImageUrl: item.image_url,
  cardExternalId: item.external_id,
  tcg: item.tcg,
  condition: item.condition,
  quantity: item.quantity,
  marketPrice: item.market_price,
});
