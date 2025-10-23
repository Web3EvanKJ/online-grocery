import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductFormFields } from './ProductFormFields';
import { ConfirmationModal } from '../ConfirmationModal';
import { ErrorModal } from '../ErrorModal';
import { Products } from '@/lib/types/products/products';
import { api } from '@/lib/axios';
import { useState } from 'react';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Products | null;
  isSuperAdmin: boolean;
}

export function ProductModal({
  open,
  onClose,
  product,
  isSuperAdmin,
}: ProductModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const isEdit = !!product;

  const handleSubmit = (values: any) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleFinalSubmit = async () => {
    try {
      if (!pendingValues) return;

      // 🔹 Separate existing URLs and new files
      console.log(pendingValues);

      const { name, category, description, price, existingUrls, newFiles } =
        pendingValues;

      let allUrls = [...(existingUrls || [])];

      // 🔹 Upload only new files to Cloudinary via backend
      if (newFiles && newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file: File) => formData.append('images', file));

        const uploadRes = await api.post('/admin/products/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        allUrls = [...allUrls, ...uploadRes.data.data];
      }

      // 🔹 Create or Update product (send only URLs)
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
    } catch (err: any) {
      setErrorModal({
        open: true,
        message: err.response?.data?.msg || err.message,
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          <ProductFormFields
            initialValues={{
              name: product?.name || '',
              category: product?.category_id || '',
              description: product?.description || '',
              price: product?.price || '',
              existingUrls: product?.images?.map((img) => img.image_url) || [],
              newFiles: [],
            }}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSuperAdmin={isSuperAdmin}
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
      />

      <ErrorModal
        open={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: '' })}
      />
    </>
  );
}
