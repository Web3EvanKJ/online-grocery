'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmationModal } from '../ConfirmationModal';
import { DiscountForm } from './DiscountForm';
import { useState } from 'react';

export function DiscountModal({ open, onClose, onSave, type, discount }: any) {
  const isEdit = type === 'edit';
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);

  const handleSaveRequest = (values: any) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (pendingValues) {
      onSave(pendingValues);
      setPendingValues(null);
    }
    setConfirmOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-xl border border-sky-200 shadow-md">
          <DialogHeader>
            <DialogTitle className="font-semibold text-sky-700">
              {isEdit ? 'Edit Discount' : 'Add Discount'}
            </DialogTitle>
          </DialogHeader>
          <DiscountForm
            onSubmit={handleSaveRequest}
            onCancel={onClose}
            discount={discount}
            isEdit={isEdit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        message="Are you sure you want to save this discount?"
      />
    </>
  );
}
