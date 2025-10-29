'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductSearchField } from './ProductSearchField';
import { FormField } from '../FormField';

interface DiscountFormProps {
  discount?: any;
  onSubmit: (values: any) => void;
  loading?: boolean;
  setOpen: (values: boolean) => void;
}

const validationSchema = Yup.object().shape({
  type: Yup.string().oneOf(['product', 'store', 'b1g1']).required('Required'),
  inputType: Yup.string().oneOf(['percentage', 'nominal']).required('Required'),
  value: Yup.number().required('Required').min(1, 'Must be > 0'),
  min_purchase: Yup.number().nullable(),
  max_discount: Yup.number().nullable(),
  start_date: Yup.string().required('Required'),
  end_date: Yup.string().required('Required'),
  product_id: Yup.number().nullable(),
});

export function DiscountForm({
  discount,
  onSubmit,
  loading,
  setOpen,
}: DiscountFormProps) {
  const initialValues = {
    type: discount?.type || 'product',
    inputType: discount?.inputType || 'percentage',
    value: discount?.value || '',
    min_purchase: discount?.min_purchase || '',
    max_discount: discount?.max_discount || '',
    start_date: discount?.start_date ? discount.start_date.split('T')[0] : '',
    end_date: discount?.end_date ? discount.end_date.split('T')[0] : '',
    product_id: discount?.product_id || null,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={(values) => {
        const data = {
          ...values,
          min_purchase: values.min_purchase
            ? Number(values.min_purchase)
            : null,
          max_discount: values.max_discount
            ? Number(values.max_discount)
            : null,
          value: Number(values.value),
          role: 'super_admin',
          user_id: 1,
        };
        onSubmit(data);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
      }) => (
        <Form className="space-y-4">
          {/* Discount Type */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Discount Type
            </label>
            <Select
              value={values.type}
              onValueChange={(v) => setFieldValue('type', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="store">Store</SelectItem>
                <SelectItem value="b1g1">Buy 1 Get 1</SelectItem>
              </SelectContent>
            </Select>
            {touched.type && typeof errors.type === 'string' && (
              <p className="mt-1 text-xs text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Input Type */}
          {values.type !== 'b1g1' && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Input Type
              </label>
              <Select
                value={values.inputType}
                onValueChange={(v) => setFieldValue('inputType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select input type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="nominal">Nominal</SelectItem>
                </SelectContent>
              </Select>
              {touched.inputType && typeof errors.inputType === 'string' && (
                <p className="mt-1 text-xs text-red-500">{errors.inputType}</p>
              )}
            </div>
          )}

          {/* Value */}
          {values.type !== 'b1g1' && (
            <FormField
              id="value"
              name="value"
              label="Value"
              type="number"
              value={values.value}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.value}
              touched={touched.value}
              required
            />
          )}

          {/* Min / Max */}
          {values.type !== 'b1g1' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="min_purchase"
                name="min_purchase"
                label="Min Purchase"
                type="number"
                value={values.min_purchase}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.min_purchase}
                touched={touched.min_purchase}
              />
              <FormField
                id="max_discount"
                name="max_discount"
                label="Max Discount"
                type="number"
                value={values.max_discount}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.max_discount}
                touched={touched.max_discount}
              />
            </div>
          )}

          {/* Product Field */}
          {values.type === 'product' && (
            <ProductSearchField
              value={values.product_id}
              onChange={(v) => setFieldValue('product_id', v)}
            />
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="start_date"
              name="start_date"
              label="Start Date"
              type="date"
              value={values.start_date}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.start_date}
              touched={touched.start_date}
              required
            />
            <FormField
              id="end_date"
              name="end_date"
              label="End Date"
              type="date"
              value={values.end_date}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.end_date}
              touched={touched.end_date}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
