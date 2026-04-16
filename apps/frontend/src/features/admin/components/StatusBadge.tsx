import { Badge } from '@/components/ui/badge';
import type { BookingStatus } from '../api';

const variants: Record<BookingStatus, 'default' | 'secondary' | 'destructive'> = {
  APPROVED: 'default', PENDING: 'secondary', REJECTED: 'destructive',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge variant={variants[status]}>{status}</Badge>;
}
