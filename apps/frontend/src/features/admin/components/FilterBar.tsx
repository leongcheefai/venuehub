import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BookingStatus } from '../api';

interface Props {
  status: BookingStatus | 'ALL';
  search: string;
  onChange: (next: { status: BookingStatus | 'ALL'; search: string }) => void;
}

export function FilterBar({ status, search, onChange }: Props) {
  return (
    <div className="flex gap-3">
      <Select value={status}
              onValueChange={(v) => onChange({ status: v as Props['status'], search })}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Input placeholder="Search name or reference…" value={search}
             onChange={(e) => onChange({ status, search: e.target.value })} />
    </div>
  );
}
