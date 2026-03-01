import type { z } from 'zod';
import type { ListingTypeSchema } from '@tcg-trade-hub/database';

type ListingTypeBadgeProps = {
  type: z.infer<typeof ListingTypeSchema>;
};

const TYPE_STYLES: Record<string, string> = {
  wts: 'bg-success/10 text-success',
  wtb: 'bg-blue-500/10 text-blue-500',
  wtt: 'bg-purple-500/10 text-purple-500',
};

const TYPE_LABELS: Record<string, string> = {
  wts: 'WTS',
  wtb: 'WTB',
  wtt: 'WTT',
};

export const ListingTypeBadge = ({ type }: ListingTypeBadgeProps) => {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_STYLES[type] ?? ''}`}>
      {TYPE_LABELS[type] ?? type.toUpperCase()}
    </span>
  );
};
