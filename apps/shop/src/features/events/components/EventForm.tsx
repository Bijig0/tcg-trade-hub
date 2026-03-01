import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import type { TcgType } from '@tcg-trade-hub/database';

type EventFormProps = {
  onSuccess: () => void;
};

const EVENT_TYPES = [
  'tournament',
  'league',
  'prerelease',
  'casual',
  'draft',
  'sealed',
  'other',
] as const;

const TCG_OPTIONS: { value: TcgType; label: string }[] = [
  { value: 'pokemon', label: 'Pokemon' },
  { value: 'mtg', label: 'Magic: The Gathering' },
  { value: 'onepiece', label: 'One Piece' },
  { value: 'lorcana', label: 'Lorcana' },
  { value: 'fab', label: 'Flesh and Blood' },
  { value: 'starwars', label: 'Star Wars: Unlimited' },
];

export const EventForm = ({ onSuccess }: EventFormProps) => {
  const queryClient = useQueryClient();

  const { data: shopData } = useQuery({
    queryKey: ['shop', 'mine'],
    queryFn: () => client.shop.get(),
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<string>('tournament');
  const [tcg, setTcg] = useState<TcgType | ''>('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [entryFee, setEntryFee] = useState('');

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof client.shop.events.create>[0]) =>
      client.shop.events.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop', 'events'] });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopData?.shop) return;

    mutation.mutate({
      shop_id: shopData.shop.id,
      title,
      description: description || null,
      event_type: eventType,
      tcg: tcg || null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      max_participants: maxParticipants ? parseInt(maxParticipants, 10) : null,
      entry_fee: entryFee ? parseFloat(entryFee) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {mutation.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {mutation.error.message}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-foreground">
          Event Title *
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Friday Night Magic"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventType" className="mb-1 block text-sm font-medium text-foreground">
            Event Type *
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tcg" className="mb-1 block text-sm font-medium text-foreground">
            TCG
          </label>
          <select
            id="tcg"
            value={tcg}
            onChange={(e) => setTcg(e.target.value as TcgType | '')}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Any / Mixed</option>
            {TCG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Event details, format, prizes..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startsAt" className="mb-1 block text-sm font-medium text-foreground">
            Starts At *
          </label>
          <input
            id="startsAt"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label htmlFor="endsAt" className="mb-1 block text-sm font-medium text-foreground">
            Ends At
          </label>
          <input
            id="endsAt"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="maxParticipants" className="mb-1 block text-sm font-medium text-foreground">
            Max Participants
          </label>
          <input
            id="maxParticipants"
            type="number"
            min="1"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="32"
          />
        </div>
        <div>
          <label htmlFor="entryFee" className="mb-1 block text-sm font-medium text-foreground">
            Entry Fee ($)
          </label>
          <input
            id="entryFee"
            type="number"
            min="0"
            step="0.01"
            value={entryFee}
            onChange={(e) => setEntryFee(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="5.00"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending || !title || !startsAt}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {mutation.isPending ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
};
