import type { z } from 'zod';
import type { ListingStatusSchema } from '@tcg-trade-hub/database';

type ListingStatusBadgeProps = {
  status: z.infer<typeof ListingStatusSchema>;
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-success/10 text-success',
  matched: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-secondary text-secondary-foreground',
  expired: 'bg-muted text-muted-foreground',
};

export const ListingStatusBadge = ({ status }: ListingStatusBadgeProps) => {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? ''}`}>
      {status}
    </span>
  );
};
