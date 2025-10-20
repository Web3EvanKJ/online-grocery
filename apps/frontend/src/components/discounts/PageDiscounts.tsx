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

const mockStores = ['Toko A', 'Toko B'];
const mockDiscounts: Discount[] = [
  {
    id: 1,
    name: 'Promo Beras 10%',
    type: 'percentage',
    applyTo: 'product',
    value: 10,
    product: 'Beras 5kg',
    startDate: '2025-10-01',
    endDate: '2025-10-31',
  },
  {
    id: 2,
    name: 'Diskon Rp5000',
    type: 'nominal',
    applyTo: 'min_purchase',
    value: 5000,
    minPurchase: 50000,
    startDate: '2025-10-15',
    endDate: '2025-11-15',
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
