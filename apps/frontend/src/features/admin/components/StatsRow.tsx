import { Card, CardContent } from '@/components/ui/card';
import { useAdminStats } from '../api';

const items: { key: 'TOTAL' | 'PENDING' | 'APPROVED' | 'REJECTED'; label: string }[] = [
  { key: 'TOTAL',    label: 'Total' },
  { key: 'PENDING',  label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export function StatsRow() {
  const { data, isLoading } = useAdminStats();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.key}>
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{it.label}</div>
            <div className="mt-2 text-3xl font-semibold">{isLoading ? '…' : data?.[it.key] ?? 0}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
