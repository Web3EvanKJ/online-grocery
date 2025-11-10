import { Discount } from '@/lib/types/discounts/discounts';
import { Button } from '../ui/button';

export default function DiscountShareTable({
  discounts,
  onEdit,
  page,
  limit,
}: {
  discounts: Discount[];
  onEdit: (discount: Discount) => void;
  page: number;
  limit: number;
}) {
  return (
    <div className="overflow-x-auto border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-sky-100 text-left text-sky-800">
            <th className="w-[40px] px-4 py-2">#</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Input Type</th>
            <th className="px-4 py-2">Value</th>
            <th className="px-4 py-2">Start Date</th>
            <th className="px-4 py-2">End Date</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {discounts.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-4 text-center text-gray-500">
                No discounts found.
              </td>
            </tr>
          ) : (
            discounts.map((d, idx) => (
              <tr
                key={d.id}
                className="border-t transition-colors hover:bg-sky-50"
              >
                <td className="px-4 py-2 text-center">
                  {(page - 1) * limit + idx + 1}
                </td>
                <td className="px-4 py-2">{d.type}</td>
                <td className="px-4 py-2">{d.product_name || '-'}</td>
                <td className="px-4 py-2">
                  {d.type === 'b1g1' ? '-' : d.inputType}
                </td>
                <td className="px-4 py-2">
                  {d.type === 'b1g1' ? '-' : d.value}
                </td>
                <td className="px-4 py-2">
                  {new Date(d.start_date).toISOString().split('T')[0]}
                </td>
                <td className="px-4 py-2">
                  {new Date(d.end_date).toISOString().split('T')[0]}
                </td>
                <td className="px-4 py-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(d)}
                    className="border-sky-200 text-sky-600"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
