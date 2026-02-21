import type { CollectionItemRow, NormalizedCard } from '@tcg-trade-hub/database';

/**
 * Maps a CollectionItemRow to a NormalizedCard for use in the listing flow.
 *
 * Collection items store card data with snake_case DB column names,
 * while NormalizedCard uses camelCase. This bridges the two shapes.
 */
const collectionItemToNormalizedCard = (item: CollectionItemRow): NormalizedCard => ({
  externalId: item.external_id,
  tcg: item.tcg,
  name: item.card_name,
  setName: item.set_name,
  setCode: item.set_code,
  number: item.card_number,
  imageUrl: item.image_url,
  marketPrice: item.market_price,
  rarity: item.rarity ?? '',
});

export default collectionItemToNormalizedCard;
