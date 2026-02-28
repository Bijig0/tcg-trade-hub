import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/orpc';
import { useAuth } from '@/context/AuthContext';
import type { TcgType } from '@tcg-trade-hub/database';

type ShopRegistrationFormProps = {
  onSuccess: () => void;
};

const TCG_OPTIONS: { value: TcgType; label: string }[] = [
  { value: 'pokemon', label: 'Pokemon' },
  { value: 'mtg', label: 'Magic: The Gathering' },
  { value: 'onepiece', label: 'One Piece' },
];

export const ShopRegistrationForm = ({ onSuccess }: ShopRegistrationFormProps) => {
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [supportedTcgs, setSupportedTcgs] = useState<TcgType[]>([]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof client.shop.register>[0]) =>
      client.shop.register(data),
    onSuccess: async () => {
      // Refresh JWT so it contains the new shop_owner role
      await refreshSession();
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      onSuccess();
    },
  });

  const toggleTcg = (tcg: TcgType) => {
    setSupportedTcgs((prev) =>
      prev.includes(tcg) ? prev.filter((t) => t !== tcg) : [...prev, tcg],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      address,
      location: null,
      email: email || null,
      phone: phone || null,
      website: website || null,
      description: description || null,
      supported_tcgs: supportedTcgs,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mutation.error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {mutation.error.message}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
          Shop Name *
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="My Local Game Store"
        />
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium text-foreground">
          Address *
        </label>
        <input
          id="address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="123 Main St, City, State 12345"
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
          placeholder="contact@myshop.com"
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
          placeholder="(555) 123-4567"
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
          placeholder="https://myshop.com"
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
          placeholder="Tell collectors about your shop..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Supported TCGs *
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

      <button
        type="submit"
        disabled={mutation.isPending || !name || !address || supportedTcgs.length === 0}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {mutation.isPending ? 'Registering...' : 'Register Shop'}
      </button>
    </form>
  );
};
