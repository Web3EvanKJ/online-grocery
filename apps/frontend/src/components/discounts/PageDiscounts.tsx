'use client';
import { useEffect, useState } from 'react';
import { DiscountTable } from './DiscountTable';
import { DiscountInactive } from './DiscountInactive';
import { DiscountModal } from './DiscountModal';
import { Button } from '@/components/ui/button';
import { ErrorModal } from '@/components/ErrorModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Discount } from '@/lib/types/discounts/discounts';
import { api } from '@/lib/axios';
import type { AxiosError } from 'axios';

export default function PageDiscounts({
  role,
  user_id,
}: {
  role: string;
  user_id: number;
}) {
  const isSuperAdmin = role === 'super_admin';
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [modalOpen, setModalOpen] = useState(false);
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [stores, setStores] = useState<{ id: number; name: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | null>(null);

  // Fetch stores for super admin
  const fetchStores = async () => {
    try {
      const res = await api.get('/admin/inventories/stores/list', {
        params: { role, user_id },
      });
      setStores(res.data);
      if (res.data.length > 0 && selectedStore === null) {
        setSelectedStore(res.data[0].id);
      }
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to fetch stores.');
    }
  };

  const handleAdd = () => {
    setEditDiscount(null);
    setModalOpen(true);
  };

  const handleEdit = (discount: Discount) => {
    setEditDiscount(discount);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setReloadKey((prev) => prev + 1);
    setModalOpen(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-sky-700">
        Discount Management
      </h1>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'active' | 'history')}
      >
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
          <TabsList className="rounded-lg bg-sky-50">
            <TabsTrigger
              value="active"
              className="rounded-md px-4 py-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
            >
              Active Discounts
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-md px-4 py-2 data-[state=active]:bg-sky-600 data-[state=active]:text-white"
            >
              Inactive Discounts
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            {/* Store selector (visible only for super_admin) */}
            {isSuperAdmin && (
              <select
                value={selectedStore ?? ''}
                onChange={(e) => setSelectedStore(Number(e.target.value))}
                className="rounded-md border border-sky-300 bg-white px-3 py-2 text-sm text-sky-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                {stores.length === 0 ? (
                  <option value="">No stores available</option>
                ) : (
                  stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))
                )}
              </select>
            )}

            {activeTab === 'active' && (
              <Button
                onClick={handleAdd}
                className="bg-sky-600 hover:bg-sky-700"
              >
                + Add Discount
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === 'active' ? (
            <DiscountTable
              key={reloadKey}
              onEdit={handleEdit}
              setError={setError}
              store_id={Number(selectedStore)}
            />
          ) : (
            <DiscountInactive
              key={reloadKey}
              onEdit={handleEdit}
              setError={setError}
              store_id={Number(selectedStore)}
            />
          )}
        </div>
      </Tabs>

      {/* Modals */}
      <DiscountModal
        open={modalOpen}
        setOpen={setModalOpen}
        onSuccess={handleSuccess}
        discount={editDiscount as Discount}
        setError={setError}
        role={role}
        store_id={Number(selectedStore)}
      />

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </div>
  );
}
