type Discount = {
  id: number;
  name: string;
  type: 'percentage' | 'nominal' | 'bogo';
  applyTo: 'product' | 'min_purchase';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  product?: string;
  startDate: string;
  endDate: string;
};

export function DiscountTable({
  data,
  onEdit,
}: {
  data: Discount[];
  onEdit: (discount: Discount) => void;
}) {
  return (
    <table className="w-full border-collapse border border-sky-200">
      <thead className="bg-sky-100 text-sky-700">
        <tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Type</th>
          <th className="p-3 text-left">Condition</th>
          <th className="p-3 text-left">Value</th>
          <th className="p-3 text-left">Active Period</th>
          <th className="p-3 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr
            key={d.id}
            className="border border-sky-200 transition hover:bg-sky-50"
          >
            <td className="p-3">{d.name}</td>
            <td className="p-3 capitalize">{d.type}</td>
            <td className="p-3">
              {d.applyTo === 'product'
                ? `Product: ${d.product}`
                : `Min Purchase: Rp${d.minPurchase?.toLocaleString()}`}
            </td>
            <td className="p-3">
              {d.type === 'percentage'
                ? `${d.value}%`
                : `Rp${d.value.toLocaleString()}`}
            </td>
            <td className="p-3">
              {d.startDate} - {d.endDate}
            </td>
            <td className="p-3 text-center">
              <button
                onClick={() => onEdit(d)}
                className="rounded-md border border-sky-300 px-3 py-1 text-sky-600 hover:bg-sky-100 active:scale-95"
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
