import { StockProduct } from '@/lib/types/stocks/stocks';

type InventoryTableProps = {
  data: StockProduct[];
  onEditClick: (product: StockProduct, type: 'increase' | 'decrease') => void;
};

export function InventoryTable({ data, onEditClick }: InventoryTableProps) {
  return (
    <table className="w-full border-collapse border border-sky-200">
      <thead className="bg-sky-100 text-sky-700">
        <tr>
          <th className="p-3 text-left">ID</th>
          <th className="p-3 text-left">Produk</th>
          <th className="p-3">Stock</th>
          <th className="p-3">Increment</th>
          <th className="p-3">Decrement</th>
          <th className="p-3">Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p) => (
          <tr
            key={p.id}
            className="h-20 border border-sky-200 align-middle hover:bg-sky-50"
          >
            <td className="p-3">{p.id}</td>

            {/* Produk */}
            <td className="p-3">
              <div className="flex items-center gap-3">
                <img
                  src={p.photo}
                  alt={p.name}
                  width={50}
                  height={50}
                  className="object-cover"
                />
                <span>{p.name}</span>
              </div>
            </td>

            <td className="p-3 text-center">{p.stock}</td>
            <td className="p-3 text-center">{p.inc}</td>
            <td className="p-3 text-center">{p.dec}</td>

            {/* Aksi */}
            <td className="p-0">
              <div className="flex h-full items-center justify-center gap-2 px-3 py-2">
                <button
                  onClick={() => onEditClick(p, 'increase')}
                  className="border px-3 py-2 transition hover:bg-sky-100 active:scale-95"
                >
                  +
                </button>
                <button
                  onClick={() => onEditClick(p, 'decrease')}
                  className="border px-3 py-2 transition hover:bg-sky-100 active:scale-95"
                >
                  -
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
