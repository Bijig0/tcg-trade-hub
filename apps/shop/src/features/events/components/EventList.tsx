import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
  completed: 'bg-secondary text-secondary-foreground',
};

export const EventList = () => {
  const queryClient = useQueryClient();

  const { data: shopData } = useQuery({
    queryKey: ['shop', 'mine'],
    queryFn: () => client.shop.get(),
  });

  const shopId = shopData?.shop?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['shop', 'events', shopId],
    queryFn: () => client.shop.events.list({ shop_id: shopId! }),
    enabled: !!shopId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.shop.events.remove({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'events'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => client.shop.events.update({ id, status: 'published' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'events'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const events = data?.events ?? [];

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No events yet. Create your first event!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{event.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{event.event_type}</span>
                {event.tcg && <span>· {event.tcg.toUpperCase()}</span>}
                <span>· {new Date(event.starts_at).toLocaleDateString()}</span>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[event.status] ?? ''}`}
            >
              {event.status}
            </span>
          </div>
          {event.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            {event.max_participants && (
              <span>Max: {event.max_participants} players</span>
            )}
            {event.entry_fee != null && event.entry_fee > 0 && (
              <span>· ${Number(event.entry_fee).toFixed(2)} entry</span>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {event.status === 'draft' && (
              <button
                type="button"
                onClick={() => publishMutation.mutate(event.id)}
                disabled={publishMutation.isPending}
                className="rounded-lg bg-success/10 px-3 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20"
              >
                Publish
              </button>
            )}
            {(event.status === 'draft' || event.status === 'published') && (
              <button
                type="button"
                onClick={() => deleteMutation.mutate(event.id)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
