import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { ProductImageUpload } from './ProductImageUpload';
import { api } from '@/lib/axios';
import { FormField } from '../FormField';
import { productValidationSchema } from '@/lib/validationSchema';

interface ProductFormFieldsProps {
  initialValues: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isSuperAdmin: boolean;
}

export function ProductFormFields({
  initialValues,
  onSubmit,
  onCancel,
  isSuperAdmin,
}: ProductFormFieldsProps) {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/admin/categories');
        setCategories(res.data.data);
      } catch {
        console.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={productValidationSchema}
      onSubmit={onSubmit}
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
            <label className="block text-sm font-medium text-sky-700">
              Category
            </label>
            <select
              name="category"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!isSuperAdmin}
              className="w-full rounded-md border border-sky-300 px-2 py-2 text-sm text-sky-700"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {touched.category && typeof errors.category === 'string' && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
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

          {/* ✅ Image Upload with DB previews */}
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
            <Button type="button" variant="outline" onClick={onCancel}>
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
