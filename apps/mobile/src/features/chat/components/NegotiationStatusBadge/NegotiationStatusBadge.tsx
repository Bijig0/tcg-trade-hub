import React from 'react';
import Badge from '@/components/ui/Badge/Badge';
import type { BadgeVariant } from '@/components/ui/Badge/Badge';
import type { NegotiationStatus } from '@tcg-trade-hub/database';

const STATUS_CONFIG: Record<
  NegotiationStatus,
  { label: string; variant: BadgeVariant }
> = {
  chatting: { label: 'Chatting', variant: 'secondary' },
  offer_pending: { label: 'Offer Pending', variant: 'outline' },
  offer_accepted: { label: 'Offer Accepted', variant: 'default' },
  meetup_proposed: { label: 'Meetup Proposed', variant: 'outline' },
  meetup_confirmed: { label: 'Meetup Confirmed', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export type NegotiationStatusBadgeProps = {
  status: NegotiationStatus;
  className?: string;
};

/** Maps a negotiation status to a human-readable label + Badge variant. */
const NegotiationStatusBadge = ({
  status,
  className,
}: NegotiationStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export default NegotiationStatusBadge;
