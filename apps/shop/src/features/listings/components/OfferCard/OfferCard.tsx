import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { listingKeys } from '../../queryKeys';

type OfferItem = {
  id: string;
  card_name: string;
  card_image_url: string;
  condition: string;
  market_price: number | null;
  quantity: number;
};

type OfferCardProps = {
  offer: {
    id: string;
    status: string;
    cash_amount: number;
    offerer_note: string | null;
    created_at: string;
    offer_items: OfferItem[];
    offerer: {
      display_name: string;
      avatar_url: string | null;
    };
  };
  listingId: string;
};

const CONDITION_LABELS: Record<string, string> = {
  nm: 'NM',
  lp: 'LP',
  mp: 'MP',
  hp: 'HP',
  dmg: 'DMG',
};

export const OfferCard = ({ offer, listingId }: OfferCardProps) => {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: () => client.pipeline.acceptOffer({ offer_id: offer.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => client.pipeline.declineOffer({ offer_id: offer.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
    },
  });

  const isPending = offer.status === 'pending';

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {offer.offerer.avatar_url ? (
            <img
              src={offer.offerer.avatar_url}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {offer.offerer.display_name[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-foreground">{offer.offerer.display_name}</span>
            <div className="text-xs text-muted-foreground">
              {new Date(offer.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
          offer.status === 'pending'
            ? 'bg-yellow-500/10 text-yellow-600'
            : offer.status === 'accepted'
              ? 'bg-success/10 text-success'
              : 'bg-muted text-muted-foreground'
        }`}>
          {offer.status}
        </span>
      </div>

      {/* Offered items */}
      {offer.offer_items.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {offer.offer_items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-2 py-1.5">
              {item.card_image_url && (
                <img src={item.card_image_url} alt="" className="h-8 w-6 rounded object-cover" />
              )}
              <span className="flex-1 text-sm text-foreground">{item.card_name}</span>
              <span className="text-xs text-muted-foreground">
                {CONDITION_LABELS[item.condition] ?? item.condition} x{item.quantity}
              </span>
              {item.market_price != null && (
                <span className="text-xs font-medium text-foreground">
                  ${Number(item.market_price).toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {offer.cash_amount > 0 && (
        <div className="mt-2 text-sm text-foreground">
          Cash offered: <span className="font-medium">${Number(offer.cash_amount).toFixed(2)}</span>
        </div>
      )}

      {offer.offerer_note && (
        <p className="mt-2 text-sm text-muted-foreground italic">"{offer.offerer_note}"</p>
      )}

      {/* Action buttons */}
      {isPending && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
            className="rounded-lg bg-success/10 px-3 py-1.5 text-sm font-medium text-success transition-colors hover:bg-success/20"
          >
            {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
          </button>
          <button
            type="button"
            onClick={() => declineMutation.mutate()}
            disabled={declineMutation.isPending}
            className="rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            {declineMutation.isPending ? 'Declining...' : 'Decline'}
          </button>
        </div>
      )}
    </div>
  );
};
