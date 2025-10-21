type Discount = {
  id: number;
  store_id: number;
  product_name?: string | null;
  type: 'product' | 'store' | 'B1G1';
  inputType: 'percentage' | 'nominal';
  value: number;
  min_purchase?: number | null;
  max_discount?: number | null;
  start_date: string;
  end_date: string;
};

export function DiscountHistory({ data }: { data: Discount[] }) {
  return (
    <div className="mt-10">
      <h2 className="mb-3 text-xl font-semibold text-sky-700">
        Discount History
      </h2>

      <table className="w-full border-collapse overflow-hidden rounded-lg border border-sky-200">
        <thead className="bg-sky-100 text-sky-700">
          <tr>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Input Type</th>
            <th className="p-3 text-left">Value</th>
            <th className="p-3 text-left">Condition</th>
            <th className="p-3 text-left">Active Period</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr
              key={d.id}
              className="border border-sky-200 transition hover:bg-sky-50"
            >
              <td className="p-3 capitalize">{d.type}</td>
              <td className="p-3 capitalize">{d.inputType}</td>
              <td className="p-3">
                {d.inputType === 'percentage'
                  ? `${d.value}%`
                  : `Rp${d.value.toLocaleString()}`}
              </td>
              <td className="p-3">
                {d.type === 'store'
                  ? `Min Purchase: Rp${d.min_purchase?.toLocaleString() || '-'}`
                  : `Product: ${d.product_name ?? '-'}`}
              </td>
              <td className="p-3">
                {d.start_date} - {d.end_date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
