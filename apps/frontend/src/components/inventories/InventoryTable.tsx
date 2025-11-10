import { InventoryTableProps } from '@/lib/types/inventories/inventories';
import Image from 'next/image';

export function InventoryTable({
  data,
  onEditClick,
  page,
}: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-sky-200">
        <thead className="bg-sky-100 text-sky-700">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-center">Stock</th>
            <th className="p-3 text-center">Increment</th>
            <th className="p-3 text-center">Decrement</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, idx) => (
            <tr
              key={p.id}
              className="h-20 border border-sky-200 align-middle hover:bg-sky-50"
            >
              <td className="px-4 py-2">{(page - 1) * 10 + idx + 1}</td>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={p.photo}
                    alt={p.name}
                    className="rounded-sm object-cover"
                    width={50}
                    height={50}
                  />
                  <span>{p.name}</span>
                </div>
              </td>
              <td className="p-3 text-center">{p.stock}</td>
              <td className="p-3 text-center">{p.inc}</td>
              <td className="p-3 text-center">{p.dec}</td>
              <td className="p-0">
                <div className="flex h-full items-center justify-center gap-2 px-3 py-2">
                  <button
                    onClick={() => onEditClick(p, 'increase')}
                    className="rounded-sm border px-3 py-2 transition hover:bg-sky-100 active:scale-95"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onEditClick(p, 'decrease')}
                    className="rounded-sm border px-3 py-2 transition hover:bg-sky-100 active:scale-95"
                  >
                    -
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
