import { ProductTableProps } from '@/lib/types/products/products';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

export function ProductTable({
  products,
  onEdit,
  onDelete,
  isSuperAdmin,
}: ProductTableProps) {
  if (!products.length) {
    return <p className="text-center text-sky-700">No products found.</p>;
  }

  return (
    <div className="overflow-x-auto border border-sky-200">
      <table className="min-w-full divide-y divide-sky-200 text-sm text-sky-800">
        <thead className="bg-sky-100">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">Image</th>
            <th className="px-4 py-2 text-left font-semibold">Name</th>
            <th className="px-4 py-2 text-left font-semibold">Category</th>
            <th className="px-4 py-2 text-left font-semibold">Price</th>
            <th className="px-4 py-2 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sky-100 bg-white">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-2">
                <img
                  src={product.images?.[0]?.image_url || '/placeholder.png'}
                  alt={product.name}
                  className="h-10 w-10 rounded object-cover"
                />
              </td>
              <td className="px-4 py-2">{product.name}</td>
              <td className="px-4 py-2">{product.category?.name || '-'}</td>
              <td className="px-4 py-2">
                Rp {product.price?.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-2">
                  {isSuperAdmin && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(product)}
                      >
                        <Pencil className="h-4 w-4 text-sky-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(product)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
