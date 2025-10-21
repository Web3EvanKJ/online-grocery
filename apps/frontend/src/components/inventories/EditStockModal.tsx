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
import { Product } from '@/lib/types/products/products';
import { inventoryValidationSchema } from '@/lib/validationSchema';

type EditStockModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    id: number;
    type: 'increase' | 'decrease';
    quantity: number;
    note?: string;
  }) => void;
  product: Product | null;
  type: 'increase' | 'decrease' | '';
};

export function EditStockModal({
  open,
  onClose,
  onSave,
  product,
  type,
}: EditStockModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);

  if (!product) return null;

  const handleSubmit = (values: any) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!pendingValues || !product) return;

    // cumulative logic
    const newQuantity =
      type === 'increase'
        ? (product.inc ?? 0) + Number(pendingValues.quantity)
        : (product.dec ?? 0) + Number(pendingValues.quantity);

    if (type != 'increase' && type != 'decrease') return;

    onSave({
      id: product.id,
      type,
      quantity: newQuantity,
      note: pendingValues.note,
    });

    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
      {/* Edit Stock Modal */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm rounded-none border border-sky-200 bg-white">
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
              stock: product.stock,
              inc: product.inc,
              dec: product.dec,
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
                  <Button type="button" variant="outline" onClick={onClose}>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        message={`Do you want to ${
          type === 'increase' ? 'increase' : 'decrease'
        } the stock by ${pendingValues?.quantity}?`}
      />
    </>
  );
}
