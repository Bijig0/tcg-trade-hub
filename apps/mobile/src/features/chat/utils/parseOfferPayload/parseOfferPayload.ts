import { CardOfferPayloadSchema } from '@tcg-trade-hub/database';
import type { z } from 'zod';

type CardOfferPayload = z.infer<typeof CardOfferPayloadSchema>;

type ParsedOffer = {
  offering: CardOfferPayload['offering'];
  requesting: CardOfferPayload['requesting'];
  cashAmount: number | null;
  cashDirection: 'offering' | 'requesting' | null;
  note: string | null;
  isTradeOnly: boolean;
  offeringCount: number;
  requestingCount: number;
};

/**
 * Parses and normalizes a card_offer message payload into a
 * display-friendly shape. Returns null if the payload is invalid.
 *
 * Accepts the inner payload object (not the message wrapper).
 */
const parseOfferPayload = (raw: unknown): ParsedOffer | null => {
  const result = CardOfferPayloadSchema.safeParse(raw);

  if (!result.success) return null;

  const data = result.data;

  return {
    offering: data.offering,
    requesting: data.requesting,
    cashAmount: data.cash_amount ?? null,
    cashDirection: data.cash_direction ?? null,
    note: data.note ?? null,
    isTradeOnly: !data.cash_amount,
    offeringCount: data.offering.length,
    requestingCount: data.requesting.length,
  };
};

export default parseOfferPayload;
export type { ParsedOffer };
