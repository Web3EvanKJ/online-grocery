'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Formik } from 'formik';
import { useState } from 'react';
import { FormField } from '@/components/FormField';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { inventoryValidationSchema } from '@/lib/validationSchema';
import { api } from '@/lib/axios';
import { ErrorModal } from '@/components/ErrorModal';
import type { AxiosError } from 'axios';
import {
  EditStockModalProps,
  PendingValues,
} from '@/lib/types/inventories/inventories';

export function EditStockModal({
  open,
  onClose,
  product,
  type,
  storeId,
  onSuccess,
}: EditStockModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<PendingValues | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleSubmit = (values: PendingValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues || !product) return;
    try {
      await api.post('/admin/inventories', {
        product_id: product.id,
        store_id: storeId,
        type: type === 'increase' ? 'in' : 'out',
        quantity: Number(pendingValues.quantity),
        note: pendingValues.note,
      });
      onSuccess();
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to update stocks.');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="border border-sky-200 bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-semibold text-sky-700">
              {type === 'increase' ? 'Add Stock' : 'Remove Stock'} -{' '}
              {product.name}
            </DialogTitle>
          </DialogHeader>

          <Formik
            initialValues={{
              quantity: '',
              note: '',
              type,
            }}
            validationSchema={inventoryValidationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit} className="space-y-3">
                <FormField
                  id="quantity"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={values.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  error={errors.quantity}
                  touched={touched.quantity}
                />

                <FormField
                  id="note"
                  name="note"
                  label="Note (optional)"
                  value={values.note}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your note..."
                  error={errors.note}
                  touched={touched.note}
                />

                <div className="flex justify-end gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="border border-sky-300 text-sky-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-sky-500 text-white hover:bg-sky-600"
                  >
                    Save
                  </Button>
                </div>
              </form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        message={`Do you want to ${
          type === 'increase' ? 'increase' : 'decrease'
        } the stock by ${pendingValues?.quantity}?`}
      />

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </>
  );
}
