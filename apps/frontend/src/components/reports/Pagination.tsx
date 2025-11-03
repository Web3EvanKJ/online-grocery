import { PaginationProps } from '@/lib/types/reports/reports';
import { Button } from '../ui/button';

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex justify-center gap-3 pt-4">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="border-sky-300"
      >
        Prev
      </Button>
      <span className="self-center text-sky-700">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="border-sky-300"
      >
        Next
      </Button>
    </div>
  );
}
