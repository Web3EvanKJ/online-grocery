import { Formik, Form } from 'formik';
import { Button } from '@/components/ui/button';
// prettier-ignore
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import { ProductSearchField } from './ProductSearchField';
import { FormField } from '../FormField';
import { DiscountFormProps } from '@/lib/types/discounts/discounts';
import { discountFormValidationSchema } from '@/lib/validationSchema';

export function DiscountForm({
  discount,
  onSubmit,
  loading,
  setOpen,
  isEdit,
  setError,
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
      validationSchema={discountFormValidationSchema}
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
        setFieldTouched,
      }) => (
        <Form className="space-y-4">
          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Discount Type <span className="text-red-500">*</span>
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
          )}
          {values.type !== 'store' && !isEdit && (
            <div className="min-h-[13vh]">
              <ProductSearchField
                onChange={(v) => {
                  setFieldValue('product_id', v);
                  setTimeout(
                    () => setFieldTouched('product_id', true, true),
                    0
                  );
                }}
                setError={setError}
              />
              {touched.product_id && typeof errors.product_id === 'string' && (
                <p className="text-xs text-red-500">{errors.product_id}</p>
              )}
            </div>
          )}
          {values.type !== 'b1g1' && (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Input Type <span className="text-red-500">*</span>
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
          {values.type !== 'b1g1' && (
            <FormField
              id="value"
              name="value"
              label="Value"
              type="number"
              value={String(values.value)}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.value}
              touched={touched.value}
              required
            />
          )}
          {values.type === 'store' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="min_purchase"
                name="min_purchase"
                label="Min Purchase"
                type="number"
                value={String(values.min_purchase)}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.min_purchase}
                touched={touched.min_purchase}
              />
              {values.inputType === 'percentage' && (
                <FormField
                  id="max_discount"
                  name="max_discount"
                  label="Max Discount"
                  type="number"
                  value={String(values.max_discount)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.max_discount}
                  touched={touched.max_discount}
                />
              )}
            </div>
          )}
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
          <div className="flex justify-end gap-2">
            {/* prettier-ignore */}
            <Button variant="outline" type="button" onClick={() => setOpen(false)} className="border-sky-300 text-sky-600">
              Cancel
            </Button>
            {/* prettier-ignore */}
            <Button type="submit" disabled={loading} className="bg-sky-500 text-white hover:bg-sky-600">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
