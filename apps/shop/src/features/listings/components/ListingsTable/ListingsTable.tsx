import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { client } from '@/lib/orpc';
import { listingKeys } from '../../queryKeys';
import { ListingTypeBadge } from '../ListingTypeBadge/ListingTypeBadge';
import { ListingStatusBadge } from '../ListingStatusBadge/ListingStatusBadge';
import type { z } from 'zod';
import type { ListingStatusSchema } from '@tcg-trade-hub/database';

type Tab = 'active' | 'matched' | 'history';

const TAB_STATUS_MAP: Record<Tab, z.infer<typeof ListingStatusSchema> | undefined> = {
  active: 'active',
  matched: 'matched',
  history: undefined,
};

export const ListingsTable = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('active');

  const status = TAB_STATUS_MAP[tab];
  const filters = { status, limit: 50, offset: 0 };

  const { data, isLoading } = useQuery({
    queryKey: listingKeys.list(filters),
    queryFn: () => client.listing.myList(filters),
  });

  // Counts per tab
  const { data: activeData } = useQuery({
    queryKey: listingKeys.list({ status: 'active' }),
    queryFn: () => client.listing.myList({ status: 'active', limit: 1, offset: 0 }),
  });
  const { data: matchedData } = useQuery({
    queryKey: listingKeys.list({ status: 'matched' }),
    queryFn: () => client.listing.myList({ status: 'matched', limit: 1, offset: 0 }),
  });

  const expireMutation = useMutation({
    mutationFn: (listingId: string) =>
      client.pipeline.expireListing({ listing_id: listingId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });

  const listings = data?.listings ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: activeData?.total ?? 0 },
    { key: 'matched', label: 'Matched', count: matchedData?.total ?? 0 },
    { key: 'history', label: 'History', count: 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {tab === 'active'
              ? 'No active listings. Create your first listing!'
              : 'No listings in this category.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-card text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">TCG</th>
                <th className="px-3 py-3">Items</th>
                <th className="px-3 py-3">Value</th>
                <th className="px-3 py-3">Offers</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((listing) => (
                <tr
                  key={listing.id}
                  className="bg-background transition-colors hover:bg-accent/50"
                >
                  <td className="px-3 py-2">
                    <ListingTypeBadge type={listing.type} />
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      to={`/dashboard/listings/${listing.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {listing.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 uppercase text-muted-foreground">{listing.tcg}</td>
                  <td className="px-3 py-2 text-foreground">
                    {listing.listing_items?.length ?? 0}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    ${Number(listing.total_value).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">
                    {listing.offer_count > 0 ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {listing.offer_count}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <ListingStatusBadge status={listing.status} />
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {listing.status === 'active' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          expireMutation.mutate(listing.id);
                        }}
                        disabled={expireMutation.isPending}
                        className="rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                      >
                        Expire
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
