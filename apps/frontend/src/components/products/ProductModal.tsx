import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductFormFields } from './ProductFormFields';
import { ConfirmationModal } from '../ConfirmationModal';
import { ErrorModal } from '../ErrorModal';
import {
  ProductFormValues,
  ProductModalProps,
} from '@/lib/types/products/products';
import { api } from '@/lib/axios';
import { useState } from 'react';
import type { AxiosError } from 'axios';

export function ProductModal({
  open,
  onClose,
  product,
  isSuperAdmin,
}: ProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<ProductFormValues | null>(
    null
  );
  const [error, setError] = useState<string | null>('');
  const isEdit = !!product;

  const handleSubmit = (values: ProductFormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const productFormInitialValues = {
    name: product?.name || '',
    category: product?.category_id || 0,
    description: product?.description || '',
    price: product?.price || '',
    existingUrls: product?.images?.map((img) => img.image_url) || [],
    newFiles: [],
  };

  const uploadImages = async (newFiles: File[]): Promise<string[]> => {
    if (!newFiles || newFiles.length === 0) return [];
    const formData = new FormData();
    newFiles.forEach((file) => formData.append('images', file));

    const uploadRes = await api.post('/admin/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return uploadRes.data.data; // assuming backend returns an array of URLs
  };

  const handleFinalSubmit = async () => {
    try {
      if (!pendingValues) return;
      setIsSubmitting(true);
      const { name, category, description, price, existingUrls, newFiles } =
        pendingValues;

      let allUrls = [...(existingUrls || [])];
      // Upload only new files to Cloudinary via backend
      const uploadedUrls = await uploadImages(newFiles);
      allUrls = [...allUrls, ...uploadedUrls];

      //  Create or Update product (send only URLs)
      const payload = {
        name,
        category_id: Number(category),
        description,
        price,
        imageUrls: allUrls,
      };

      if (isEdit && product?.id) {
        await api.put(`/admin/products/${product.id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }

      setConfirmOpen(false);
      setPendingValues(null);
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed interaction with product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <ProductFormFields
            initialValues={productFormInitialValues}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSuperAdmin={isSuperAdmin}
            setError={setError}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFinalSubmit}
        message={
          isEdit
            ? 'Are you sure you want to update this product?'
            : 'Are you sure you want to create this product?'
        }
        loading={isSubmitting}
      />

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </>
  );
}
