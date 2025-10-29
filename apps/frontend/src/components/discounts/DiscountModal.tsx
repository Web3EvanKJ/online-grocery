'use client';

import { useState } from 'react';
import { api } from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DiscountForm } from './DiscountForm';

interface DiscountModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  discount?: any;
  onSuccess: () => void;
  setError: (err: string | null) => void;
}

export function DiscountModal({
  open,
  setOpen,
  discount,
  onSuccess,
  setError,
}: DiscountModalProps) {
  const [loading, setLoading] = useState(false);

  const isEdit = !!discount;

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      setError(null);

      if (isEdit) {
        await api.put(`/admin/discounts/${discount.id}`, values);
      } else {
        await api.post('/admin/discounts', values);
      }

      onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.msg || 'Failed to save discount';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Discount' : 'Add Discount'}
            </DialogTitle>
          </DialogHeader>

          <DiscountForm
            discount={discount}
            onSubmit={handleSubmit}
            loading={loading}
            setOpen={setOpen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
