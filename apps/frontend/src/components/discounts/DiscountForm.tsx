'use client';
import { Formik } from 'formik';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { discountValidationSchema } from '@/lib/validationSchema';
import { ProductSearchField } from './ProductSearchField';

export function DiscountForm({ discount, isEdit, onSubmit, onCancel }: any) {
  const initialValues = discount || {
    name: '',
    type: 'percentage',
    value: 0,
    minPurchase: '',
    product: '',
    startDate: '',
    endDate: '',
  };

  const getApplyTo = (type: string) =>
    type === 'nominal' ? 'min_purchase' : 'product';

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={discountValidationSchema}
      onSubmit={(values) => {
        const applyTo = getApplyTo(values.type);
        onSubmit({ ...values, applyTo });
      }}
    >
      {({ values, handleChange, handleSubmit, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormField
            id="name"
            name="name"
            label="Discount Name"
            value={values.name}
            onChange={handleChange}
            required
          />

          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={values.type}
              onChange={handleChange}
              disabled={isEdit}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 ${
                isEdit ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''
              }`}
            >
              <option value="percentage">Percentage</option>
              <option value="nominal">Nominal</option>
              <option value="bogo">BOGO</option>
            </select>
          </div>

          {(values.type === 'percentage' || values.type === 'bogo') && (
            <ProductSearchField
              value={values.product}
              disabled={isEdit}
              onChange={handleChange}
              setFieldValue={setFieldValue}
            />
          )}

          {values.type === 'nominal' && (
            <FormField
              id="minPurchase"
              name="minPurchase"
              label="Min Purchase (Rp)"
              type="number"
              value={values.minPurchase}
              onChange={handleChange}
              required
            />
          )}

          {values.type !== 'bogo' && (
            <FormField
              id="value"
              name="value"
              label={
                values.type === 'percentage' ? 'Discount (%)' : 'Discount (Rp)'
              }
              type="number"
              value={values.value}
              onChange={handleChange}
              required
            />
          )}

          <div className="flex gap-2">
            <FormField
              id="startDate"
              name="startDate"
              label="Start Date"
              type="date"
              value={values.startDate}
              onChange={handleChange}
              required
            />
            <FormField
              id="endDate"
              name="endDate"
              label="End Date"
              type="date"
              value={values.endDate}
              onChange={handleChange}
              required
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
