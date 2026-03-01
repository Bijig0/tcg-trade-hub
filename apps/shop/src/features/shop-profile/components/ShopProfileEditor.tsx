import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import type { TcgType } from '@tcg-trade-hub/database';

const TCG_OPTIONS: { value: TcgType; label: string }[] = [
  { value: 'pokemon', label: 'Pokemon' },
  { value: 'mtg', label: 'Magic: The Gathering' },
  { value: 'onepiece', label: 'One Piece' },
  { value: 'lorcana', label: 'Lorcana' },
  { value: 'fab', label: 'Flesh and Blood' },
  { value: 'starwars', label: 'Star Wars: Unlimited' },
];

export const ShopProfileEditor = () => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['shop', 'mine'],
    queryFn: () => client.shop.get(),
  });

  const shop = data?.shop;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [supportedTcgs, setSupportedTcgs] = useState<TcgType[]>([]);
  const [hostsEvents, setHostsEvents] = useState(false);
  const [seatingCapacity, setSeatingCapacity] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');

  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setAddress(shop.address);
      setSuburb(shop.suburb ?? '');
      setEmail(shop.email ?? '');
      setPhone(shop.phone ?? '');
      setWebsite(shop.website ?? '');
      setDescription(shop.description ?? '');
      setSupportedTcgs(shop.supported_tcgs);
      setHostsEvents(shop.hosts_events ?? false);
      setSeatingCapacity(shop.seating_capacity?.toString() ?? '');
      const links = shop.social_links as Record<string, string> | null;
      setInstagramUrl(links?.instagram ?? '');
    }
  }, [shop]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof client.shop.update>[0]) =>
      client.shop.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop'] });
    },
  });

  const toggleTcg = (tcg: TcgType) => {
    setSupportedTcgs((prev) =>
      prev.includes(tcg) ? prev.filter((t) => t !== tcg) : [...prev, tcg],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const socialLinks = instagramUrl ? { instagram: instagramUrl } : null;
    mutation.mutate({
      name,
      address,
      suburb: suburb || null,
      email: email || null,
      phone: phone || null,
      website: website || null,
      description: description || null,
      supported_tcgs: supportedTcgs,
      hosts_events: hostsEvents,
      seating_capacity: seatingCapacity ? parseInt(seatingCapacity, 10) : null,
      social_links: socialLinks,
    });
  };

  if (!shop) return null;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {mutation.isSuccess && (
        <div className="rounded-lg bg-success/10 p-3 text-sm text-success">
          Profile updated successfully.
        </div>
      )}
      {mutation.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {mutation.error.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
          Shop Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium text-foreground">
          Address
        </label>
        <input
          id="address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="suburb" className="mb-1 block text-sm font-medium text-foreground">
          Suburb
        </label>
        <input
          id="suburb"
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
          Contact Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-foreground">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="website" className="mb-1 block text-sm font-medium text-foreground">
          Website
        </label>
        <input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
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
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Supported TCGs
        </label>
        <div className="flex flex-wrap gap-2">
          {TCG_OPTIONS.map((tcg) => (
            <button
              key={tcg.value}
              type="button"
              onClick={() => toggleTcg(tcg.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                supportedTcgs.includes(tcg.value)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {tcg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="hostsEvents"
          type="checkbox"
          checked={hostsEvents}
          onChange={(e) => setHostsEvents(e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        <label htmlFor="hostsEvents" className="text-sm font-medium text-foreground">
          Hosts events (tournaments, leagues, etc.)
        </label>
      </div>

      <div>
        <label htmlFor="seatingCapacity" className="mb-1 block text-sm font-medium text-foreground">
          Seating Capacity
        </label>
        <input
          id="seatingCapacity"
          type="number"
          min="0"
          value={seatingCapacity}
          onChange={(e) => setSeatingCapacity(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="e.g. 30"
        />
      </div>

      <div>
        <label htmlFor="instagramUrl" className="mb-1 block text-sm font-medium text-foreground">
          Instagram URL
        </label>
        <input
          id="instagramUrl"
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="https://instagram.com/yourshop"
        />
      </div>

      {shop.google_rating != null && (
        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <p className="text-sm font-medium text-foreground">Google Rating</p>
          <p className="text-sm text-muted-foreground">
            {shop.google_rating}/5 ({shop.google_review_count ?? 0} reviews)
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {mutation.isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
};
