import { SummaryCardProps } from '@/lib/types/reports/reports';

export function SummaryCard({ title, value, color }: SummaryCardProps) {
  return (
    <div className={`${color || 'bg-sky-50'} p-4 text-center`}>
      <p className="text-sm text-sky-600">{title}</p>
      <p className="text-xl font-bold text-sky-700">{value}</p>
    </div>
  );
}
