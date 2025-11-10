'use client';
import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import { Button } from '@/components/ui/button';
import { ProductImageUpload } from './ProductImageUpload';
import { api } from '@/lib/axios';
import { FormField } from '../FormField';
import { productValidationSchema } from '@/lib/validationSchema';
import { ProductFormFieldsProps } from '@/lib/types/products/products';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { AxiosError } from 'axios';

export function ProductFormFields({
  initialValues,
  onSubmit,
  onCancel,
  isSuperAdmin,
  setError,
}: ProductFormFieldsProps) {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/admin/categories', {
          params: { page: 1, limit: 15 },
        });
        setCategories(res.data.data);
      } catch (err) {
        const error = err as AxiosError<{ msg?: string }>;
        setError(error.response?.data?.msg || 'Failed to load categories.');
      }
    };
    fetchCategories();
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={productValidationSchema}
      onSubmit={onSubmit}
      validateOnBlur
      validateOnChange
      enableReinitialize
    >
      {({
        setFieldValue,
        values,
        handleChange,
        handleBlur,
        errors,
        touched,
      }) => (
        <Form className="space-y-4">
          <FormField
            id="name"
            name="name"
            label="Name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter name"
            required
            disabled={!isSuperAdmin}
            error={errors.name}
            touched={touched.name}
          />

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>

            <Select
              value={values.category?.toString() || ''} // ensure string value
              onValueChange={(value) => setFieldValue('category', value)}
              disabled={!isSuperAdmin}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>

              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {touched.category && typeof errors.category === 'string' && (
              <p className="mt-1 text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          <FormField
            id="price"
            name="price"
            label="Price"
            type="number"
            value={values.price}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter price"
            required
            disabled={!isSuperAdmin}
            error={errors.price}
            touched={touched.price}
          />

          <FormField
            id="description"
            name="description"
            label="Description"
            type="textarea"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter product description"
            required
            disabled={!isSuperAdmin}
            error={errors.description}
            touched={touched.description}
          />

          <ProductImageUpload
            existingUrls={values.existingUrls}
            onChange={(newFiles, remainingUrls) => {
              setFieldValue('newFiles', newFiles);
              setFieldValue('existingUrls', remainingUrls);
            }}
            disabled={!isSuperAdmin}
          />
          {(touched.existingUrls && errors.existingUrls) ||
          (touched.newFiles && errors.newFiles) ? (
            <p className="mt-1 text-sm text-red-500">
              {(errors.existingUrls as string) || (errors.newFiles as string)}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-sky-300 text-sky-600"
            >
              Cancel
            </Button>
            {isSuperAdmin && (
              <Button
                type="submit"
                className="bg-sky-600 text-white hover:bg-sky-700"
              >
                Save
              </Button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}
