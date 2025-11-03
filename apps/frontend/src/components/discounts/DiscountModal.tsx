'use client';
import { useState } from 'react';
import { api } from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DiscountForm } from './DiscountForm';
import type { AxiosError } from 'axios';
import {
  DiscountModalProps,
  onSubmitDiscountProps,
} from '@/lib/types/discounts/discounts';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export function DiscountModal({
  open,
  setOpen,
  discount,
  onSuccess,
  setError,
  role,
  user_id,
}: DiscountModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<onSubmitDiscountProps | null>(null);

  const isEdit = !!discount;

  const handleSubmit = (values: onSubmitDiscountProps) => {
    // Open confirmation modal first
    setPendingValues({ ...values, role, user_id });
    setConfirmOpen(true);
  };

  const confirmSave = async () => {
    if (!pendingValues) return;

    try {
      setLoading(true);
      setError(null);
      setConfirmOpen(false);

      if (isEdit) {
        await api.put(`/admin/discounts/${discount?.id}`, pendingValues);
      } else {
        await api.post('/admin/discounts', pendingValues);
      }

      onSuccess();
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to save discount.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
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
            isEdit={isEdit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmSave}
        message={
          isEdit
            ? 'Are you sure you want to update this discount?'
            : 'Are you sure you want to create this discount?'
        }
      />
    </>
  );
}
