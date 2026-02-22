import React from 'react';
import Badge from '@/components/ui/Badge/Badge';
import type { BadgeVariant } from '@/components/ui/Badge/Badge';
import type { OfferStatus } from '@tcg-trade-hub/database';

type OfferStatusBadgeProps = {
  status: OfferStatus;
};

const STATUS_CONFIG: Record<OfferStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  accepted: { label: 'Accepted', variant: 'default' },
  declined: { label: 'Declined', variant: 'destructive' },
  countered: { label: 'Countered', variant: 'outline' },
  withdrawn: { label: 'Withdrawn', variant: 'outline' },
};

/**
 * Badge component that displays the status of an offer
 * with appropriate color coding per status.
 */
const OfferStatusBadge = ({ status }: OfferStatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default OfferStatusBadge;
