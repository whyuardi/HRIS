'use client';

import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge
      variant="secondary"
      className={`${colorClass} border-0 font-medium text-[11px] px-2 py-0.5 ${className}`}
    >
      {label}
    </Badge>
  );
}
