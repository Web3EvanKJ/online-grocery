'use client';
import { useState } from 'react';
import { DiscountTable } from './DiscountTable';
import { DiscountModal } from './DiscountModal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { DiscountHistory } from './DiscountHistory';

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

const mockStores = ['Toko A', 'Toko B'];
const mockDiscounts: Discount[] = [
  {
    id: 1,
    store_id: 101,
    product_name: 'Beras 1kg',
    type: 'product',
    inputType: 'percentage',
    value: 15, // 15% discount
    min_purchase: 50000,
    max_discount: 20000,
    start_date: '2025-10-01',
    end_date: '2025-10-31',
  },
  {
    id: 2,
    store_id: 102,
    product_name: null, // store-wide discount
    type: 'store',
    inputType: 'nominal',
    value: 10000, // flat 10,000 off
    min_purchase: 75000,
    max_discount: null,
    start_date: '2025-09-15',
    end_date: '2025-10-15',
  },
  {
    id: 3,
    store_id: 103,
    product_name: 'Minyak 5L',
    type: 'B1G1',
    inputType: 'nominal',
    value: 0, // B1G1 doesn’t need a value
    min_purchase: null,
    max_discount: null,
    start_date: '2025-10-05',
    end_date: '2025-10-20',
  },
];

const mockHistory: Discount[] = [
  {
    id: 101,
    store_id: 101,
    product_name: 'Gula 1kg',
    type: 'product',
    inputType: 'percentage',
    value: 10,
    start_date: '2025-08-01',
    end_date: '2025-08-31',
  },
  {
    id: 102,
    store_id: 102,
    product_name: null,
    type: 'store',
    inputType: 'nominal',
    value: 5000,
    min_purchase: 30000,
    start_date: '2025-07-01',
    end_date: '2025-07-31',
  },
  {
    id: 103,
    store_id: 103,
    product_name: 'Sabun Cuci',
    type: 'B1G1',
    inputType: 'nominal',
    value: 0,
    start_date: '2025-06-15',
    end_date: '2025-07-15',
  },
];

export default function PageDiscounts() {
  const isSuperAdmin = true; // ubah sesuai role
  const [selectedStore, setSelectedStore] = useState(mockStores[0]);
  const [data, setData] = useState<Discount[]>(mockDiscounts);
  const [modal, setModal] = useState<{
    open: boolean;
    type: 'add' | 'edit' | '';
    discount: Discount | null;
  }>({ open: false, type: '', discount: null });

  const handleSave = (discount: Discount) => {
    if (modal.type === 'edit') {
      setData((prev) => prev.map((d) => (d.id === discount.id ? discount : d)));
    } else {
      setData((prev) => [...prev, { ...discount, id: prev.length + 1 }]);
    }
    setModal({ open: false, type: '', discount: null });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-sky-700">
          Discount Management
        </h1>

        <Button
          className="bg-sky-500 text-white hover:bg-sky-600"
          onClick={() => setModal({ open: true, type: 'add', discount: null })}
        >
          + Add Discount
        </Button>
      </div>

      {isSuperAdmin && (
        <div className="max-w-xs">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="border-sky-300 focus:ring-sky-300">
              <SelectValue placeholder="Choose Store" />
            </SelectTrigger>
            <SelectContent>
              {mockStores.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <DiscountTable
        data={data}
        onEdit={(d) => setModal({ open: true, type: 'edit', discount: d })}
      />

      <DiscountHistory data={mockHistory} />

      <DiscountModal
        open={modal.open}
        type={modal.type}
        discount={modal.discount}
        onClose={() => setModal({ open: false, type: '', discount: null })}
        onSave={handleSave}
      />
    </div>
  );
}
