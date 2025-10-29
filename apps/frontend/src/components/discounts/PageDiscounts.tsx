'use client';

import { useState } from 'react';
import { DiscountTable } from './DiscountTable';
import { DiscountInactive } from './DiscountInactive';
import { DiscountModal } from './DiscountModal';
import { Button } from '@/components/ui/button';
import { ErrorModal } from '@/components/ErrorModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PageDiscounts() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [modalOpen, setModalOpen] = useState(false);
  const [editDiscount, setEditDiscount] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleAdd = () => {
    setEditDiscount(null);
    setModalOpen(true);
  };

  const handleEdit = (discount: any) => {
    console.log(discount);

    setEditDiscount(discount);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setReloadKey((prev) => prev + 1);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Title */}
      <h1 className="text-2xl font-semibold text-sky-700">
        Discount Management
      </h1>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
        <div className="flex items-center justify-between">
          <TabsList className="rounded-lg bg-sky-50 p-1">
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
              Inactive Discount
            </TabsTrigger>
          </TabsList>

          {activeTab === 'active' && (
            <Button onClick={handleAdd} className="bg-sky-600 hover:bg-sky-700">
              + Add Discount
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="mt-4">
          {activeTab === 'active' ? (
            <DiscountTable
              key={reloadKey}
              onEdit={handleEdit}
              setError={setError}
            />
          ) : (
            <DiscountInactive key={reloadKey} setError={setError} />
          )}
        </div>
      </Tabs>

      {/* Modals */}
      {modalOpen && (
        <DiscountModal
          open={modalOpen}
          setOpen={setModalOpen}
          onSuccess={handleSuccess}
          discount={editDiscount}
          setError={setError}
        />
      )}

      {error && (
        <ErrorModal
          open={!!error}
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}
