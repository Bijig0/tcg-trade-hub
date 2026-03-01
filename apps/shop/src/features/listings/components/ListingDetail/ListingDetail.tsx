import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { listingKeys } from '../../queryKeys';
import { ListingTypeBadge } from '../ListingTypeBadge/ListingTypeBadge';
import { ListingStatusBadge } from '../ListingStatusBadge/ListingStatusBadge';
import { OfferCard } from '../OfferCard/OfferCard';

type ListingDetailProps = {
  listingId: string;
};

const CONDITION_LABELS: Record<string, string> = {
  nm: 'NM',
  lp: 'LP',
  mp: 'MP',
  hp: 'HP',
  dmg: 'DMG',
};

export const ListingDetail = ({ listingId }: ListingDetailProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: listingKeys.detail(listingId),
    queryFn: () => client.listing.get({ id: listingId }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-destructive">Failed to load listing details.</p>
      </div>
    );
  }

  const { listing, items, offers } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ListingTypeBadge type={listing.type} />
        <ListingStatusBadge status={listing.status} />
        <span className="text-sm uppercase text-muted-foreground">{listing.tcg}</span>
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground">{listing.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Created {new Date(listing.created_at).toLocaleDateString()} · Total value: $
          {Number(listing.total_value).toFixed(2)}
          {listing.cash_amount > 0 && ` · Cash: $${Number(listing.cash_amount).toFixed(2)}`}
        </p>
      </div>

      {listing.description && (
        <p className="text-sm text-foreground">{listing.description}</p>
      )}

      <div className="flex gap-3 text-sm">
        {listing.accepts_cash && (
          <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
            Accepts Cash
          </span>
        )}
        {listing.accepts_trades && (
          <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-500">
            Accepts Trades
          </span>
        )}
      </div>

      {/* Items table */}
      <section>
        <h3 className="mb-3 font-semibold text-foreground">Items ({items.length})</h3>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-card text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Card</th>
                <th className="px-3 py-2">Set</th>
                <th className="px-3 py-2">Cond</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Market</th>
                <th className="px-3 py-2">Asking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="bg-background">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {item.card_image_url && (
                        <img src={item.card_image_url} alt="" className="h-8 w-6 rounded object-cover" />
                      )}
                      <span className="font-medium text-foreground">{item.card_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{item.card_set}</td>
                  <td className="px-3 py-2">{CONDITION_LABELS[item.condition] ?? item.condition}</td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">
                    {item.market_price != null ? `$${Number(item.market_price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {item.asking_price != null ? `$${Number(item.asking_price).toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Offers section */}
      <section>
        <h3 className="mb-3 font-semibold text-foreground">Offers ({offers.length})</h3>
        {offers.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground">No offers yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} listingId={listingId} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
