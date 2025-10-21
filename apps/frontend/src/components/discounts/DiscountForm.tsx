'use client';
import { Formik } from 'formik';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { discountValidationSchema } from '@/lib/validationSchema';
import { ProductSearchField } from './ProductSearchField';

export function DiscountForm({ discount, isEdit, onSubmit, onCancel }: any) {
  const initialValues = discount || {
    type: 'product',
    inputType: 'percentage',
    value: 0,
    min_purchase: '',
    product_name: '',
    start_date: '',
    end_date: '',
  };
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={discountValidationSchema}
      onSubmit={(values) => onSubmit(values)}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        isValid,
        setFieldValue,
      }) => (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Type */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={values.type}
              onChange={handleChange}
              disabled={isEdit}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value="product">Product</option>
              <option value="store">Store-wide</option>
              <option value="b1g1">Buy 1 Get 1</option>
            </select>
            {isEdit && (
              <div className="text-xs font-medium text-gray-500">(locked)</div>
            )}
          </div>

          {/* Input Type */}
          {values.type !== 'b1g1' && (
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Input Type <span className="text-red-500">*</span>
              </label>
              <select
                id="inputType"
                name="inputType"
                value={values.inputType}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="percentage">Percentage</option>
                <option value="nominal">Nominal</option>
              </select>
            </div>
          )}

          {/* Conditional fields */}
          {values.type !== 'store' && (
            <ProductSearchField
              fieldName="product_name"
              value={values.product_name}
              disabled={isEdit}
              onChange={handleChange}
              setFieldValue={setFieldValue}
              error={errors.product_name}
              touched={touched.product_name}
              handleBlur={handleBlur}
            />
          )}

          {values.type === 'store' && (
            <FormField
              id="min_purchase"
              name="min_purchase"
              label="Min Purchase (Rp)"
              type="number"
              value={values.min_purchase}
              onChange={handleChange}
            />
          )}

          {values.type !== 'b1g1' && (
            <FormField
              id="value"
              name="value"
              label={
                values.inputType === 'percentage'
                  ? 'Discount (%)'
                  : 'Discount (Rp)'
              }
              type="number"
              value={values.value}
              onChange={handleChange}
              error={errors.value}
              touched={touched.value}
              onBlur={handleBlur}
              required
            />
          )}

          {/* Dates */}
          <div className="flex gap-2">
            <FormField
              id="start_date"
              name="start_date"
              label="Start Date"
              type="date"
              value={values.start_date}
              onChange={handleChange}
              error={errors.start_date}
              touched={touched.start_date}
              onBlur={handleBlur}
            />
            <FormField
              id="end_date"
              name="end_date"
              label="End Date"
              type="date"
              value={values.end_date}
              onChange={handleChange}
              error={errors.end_date}
              touched={touched.end_date}
              required
              onBlur={handleBlur}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={onCancel}>
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
  );
}
