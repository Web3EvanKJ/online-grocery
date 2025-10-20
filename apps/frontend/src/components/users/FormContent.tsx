import { Formik, Form } from 'formik';
import { FormField } from '../FormField';
import { Button } from '@/components/ui/button';

const FormContent = ({
  user,
  setPendingValues,
  setConfirmOpen,
  setOpen,
  validationSchema,
}: any) => {
  const initialValues = {
    name: user?.name || '',
    email: user?.email || '',
    province: user?.province || '',
    city: user?.city || '',
    district: user?.district || '',
    address: user?.address || '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnBlur
      validateOnChange
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        setPendingValues(values);
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
        handleSubmit,
        isSubmitting,
        isValid,
      }) => (
        <Form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <FormField
            id="name"
            name="name"
            label="Full Name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter the full name"
            required
            error={errors.name}
            touched={touched.name}
          />

          <FormField
            id="email"
            name="email"
            label="Email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. admin@yourstore.com"
            required
            error={errors.email}
            touched={touched.email}
          />

          <FormField
            id="province"
            name="province"
            label="Province"
            value={values.province}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Jawa Barat"
            required
            error={errors.province}
            touched={touched.province}
          />

          <FormField
            id="city"
            name="city"
            label="City / Regency"
            value={values.city}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Bandung"
            required
            error={errors.city}
            touched={touched.city}
          />

          <FormField
            id="district"
            name="district"
            label="District"
            value={values.district}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Sukajadi"
            required
            error={errors.district}
            touched={touched.district}
          />

          <FormField
            id="address"
            name="address"
            label="Full Address"
            value={values.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Street name, number"
            required
            error={errors.address}
            touched={touched.address}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-sky-300 text-sky-600 hover:bg-sky-50"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`text-white ${
                !isValid
                  ? 'cursor-not-allowed bg-sky-300'
                  : 'bg-sky-500 hover:bg-sky-600'
              }`}
            >
              Save
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
export default FormContent;
