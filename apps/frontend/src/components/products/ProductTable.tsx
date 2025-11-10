import { ProductTableProps } from '@/lib/types/products/products';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

export function ProductTable({
  products,
  onEdit,
  onDelete,
  isSuperAdmin,
  page,
}: ProductTableProps) {
  if (!products.length) {
    return <p className="text-center text-sky-700">No products found.</p>;
  }

  return (
    <div className="overflow-x-auto border border-sky-200">
      <table className="min-w-full divide-y divide-sky-200 text-sm text-sky-800">
        <thead className="bg-sky-100">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">#</th>
            <th className="px-4 py-2 text-left font-semibold">Image</th>
            <th className="px-4 py-2 text-left font-semibold">Name</th>
            <th className="px-4 py-2 text-left font-semibold">Category</th>
            <th className="px-4 py-2 text-left font-semibold">Price</th>
            {isSuperAdmin && (
              <th className="px-4 py-2 text-center font-semibold">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-sky-100 bg-white">
          {products.map((product, idx) => (
            <tr key={product.id}>
              <td className="px-4 py-2">{(page - 1) * 5 + idx + 1}</td>
              <td className="px-4 py-2">
                <Image
                  src={product.images?.[0]?.image_url}
                  alt={product.name}
                  className="rounded object-cover"
                  width={40}
                  height={40}
                />
              </td>
              <td className="px-4 py-2">{product.name}</td>
              <td className="px-4 py-2">{product.category?.name || '-'}</td>
              <td className="px-4 py-2">
                Rp {product.price?.toLocaleString()}
              </td>
              {isSuperAdmin && (
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onEdit(product)}>
                      <p className="text-sky-600">Edit</p>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onDelete(product)}
                      className="border border-red-600"
                    >
                      <p className="text-red-600">Delete</p>
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
