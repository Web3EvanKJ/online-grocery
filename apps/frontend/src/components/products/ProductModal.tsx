'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Formik, Form } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { productValidationSchema } from '@/lib/validationSchema';
import { ConfirmationModal } from '../ConfirmationModal';
import { ErrorModal } from '../ErrorModal';
import { ProductImageUpload } from './ProductImageUpload';
import { ProductFormFields } from './ProductFormFields';

export function ProductModal({ open, onClose, product, isSuperAdmin }: any) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const formikRef = useRef<any>(null);

  const isEdit = !!product;

  useEffect(() => {
    if (open) {
      if (product?.images && Array.isArray(product.images))
        setPreviews(product.images);
      else if (product?.image) setPreviews([product.image]);
      else setPreviews([]);
    } else setPreviews([]);
  }, [open, product]);

  const initialValues = {
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price || '',
    stock: product?.stock || '',
    images: [] as File[],
  };

  const handleFinalSubmit = () => {
    console.log('✅ Final saved:', pendingValues);
    setConfirmOpen(false);
    setPendingValues(null);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-h-[80vh] overflow-y-auto rounded-2xl border border-sky-100 bg-white sm:max-w-lg">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-semibold text-sky-700">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>

          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={productValidationSchema(isEdit)}
            onSubmit={(values) => {
              console.log('Submitting...', values);
              setPendingValues({ ...values, previews });
              setConfirmOpen(true);
            }}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
              setTouched,
            }) => (
              <Form className="space-y-4 pb-4">
                <ProductImageUpload
                  previews={previews}
                  setPreviews={setPreviews}
                  setErrorModal={setErrorModal}
                  setFieldValue={setFieldValue}
                  setTouched={setTouched}
                  values={values}
                  errors={errors}
                  touched={touched}
                  formikRef={formikRef}
                  isSuperAdmin={isSuperAdmin}
                />

                <ProductFormFields
                  values={values}
                  errors={errors}
                  touched={touched}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  setFieldValue={setFieldValue}
                  isSuperAdmin={isSuperAdmin}
                />

                {isSuperAdmin && (
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-sky-500 text-white hover:bg-sky-600"
                      onClick={() => formikRef.current?.handleSubmit()}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <ErrorModal
        open={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: '' })}
      />

      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFinalSubmit}
        message="Are you sure you want to save this product?"
      />
    </>
  );
}
