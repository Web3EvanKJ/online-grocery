'use client';

import { useState } from 'react';
import { InventoryTable } from './InventoryTable';
import { EditStockModal } from './EditStockModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/lib/types/products/products';

const mockStores = ['Toko A', 'Toko B'];
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Beras 5kg',
    photo:
      'https://i.pinimg.com/736x/b2/ff/1f/b2ff1fe8f96d3b1b00703e3b704a6318.jpg',
    stock: 50,
    inc: 10,
    dec: 5,
  },
  {
    id: 2,
    name: 'Minyak Goreng 1L',
    photo:
      'https://i.pinimg.com/736x/d2/41/bc/d241bc79ceed78f4d2d43cfe94935ee2.jpg',
    stock: 30,
    inc: 5,
    dec: 8,
  },
  {
    id: 3,
    name: 'Gula Pasir 1kg',
    photo:
      'https://i.pinimg.com/736x/a0/f7/44/a0f744205d73af430454ec0736971fdf.jpg',
    stock: 40,
    inc: 0,
    dec: 10,
  },
];

export default function PageInventories() {
  const isSuperAdmin = true; // ubah sesuai role
  const [selectedStore, setSelectedStore] = useState(mockStores[0]);

  const [data, setData] = useState<Product[]>(mockProducts);
  const [modal, setModal] = useState<{
    open: boolean;
    type: 'increase' | 'decrease' | '';
    product: Product | null;
  }>({
    open: false,
    type: '',
    product: null,
  });

  const handleSave = ({ id, type, quantity }: any) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              inc: type === 'increase' ? quantity : p.inc,
              dec: type === 'decrease' ? quantity : p.dec,
            }
          : p
      )
    );
    setModal({ open: false, type: '', product: null });
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-sky-700">
        Inventory Management
      </h1>

      {isSuperAdmin && (
        <div className="max-w-xs">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="rounded-none border border-blue-200">
              <SelectValue placeholder="Choose Store" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {mockStores.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <InventoryTable
        data={data}
        onEditClick={(product, type) => setModal({ open: true, type, product })}
      />

      <EditStockModal
        open={modal.open}
        type={modal.type}
        product={modal.product}
        onClose={() => setModal({ open: false, type: '', product: null })}
        onSave={handleSave}
      />
    </div>
  );
}
