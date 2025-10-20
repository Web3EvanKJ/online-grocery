// ProductTable.tsx
'use client';

import { Button } from '@/components/ui/button';

export function ProductTable({
  products,
  onEdit,
  onDelete,
  isSuperAdmin,
}: any) {
  return (
    <div className="overflow-x-auto border border-sky-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-sky-100 text-sky-800">
          <tr>
            <th className="p-3 text-left">Image</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Price</th>
            {/* <th className="p-3 text-left">Stock</th> */}
            {isSuperAdmin && <th className="p-3 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-sky-600">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((p: any) => (
              <tr
                key={p.id}
                className="border-t border-sky-100 hover:bg-sky-50"
              >
                <td className="p-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">Rp {p.price.toLocaleString()}</td>
                {/* <td className="p-3">{p.stock}</td> */}
                {isSuperAdmin && (
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        className="border-sky-300 text-sky-600 hover:bg-sky-100"
                        onClick={() => onEdit(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="border-rose-300 text-rose-500 hover:bg-rose-100"
                        onClick={() => onDelete(p)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
