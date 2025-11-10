'use client';
import { Formik, Form } from 'formik';
import { FormField } from '../FormField';
import { Button } from '@/components/ui/button';
import { MapPicker } from './MapPicker';
import { reverseGeocode } from '@/lib/geocode';
import { FormContentProps } from '@/lib/types/users/users';
import { validationStoreAdminSchema } from '@/lib/validationSchema';
import { useState } from 'react';

const FormContent = ({
  user,
  setPendingValues,
  setConfirmOpen,
  setOpen,
  setError,
}: FormContentProps) => {
  const [geoLoading, setGeoLoading] = useState(false);

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
      validationSchema={validationStoreAdminSchema}
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
        setFieldValue,
        isSubmitting,
        isValid,
      }) => {
        const handleMapSelect = async (lat: number, lng: number) => {
          try {
            setGeoLoading(true);
            const result = await reverseGeocode(lat, lng);
            setFieldValue('province', result.province);
            setFieldValue('city', result.city);
            setFieldValue('district', result.district);
            setFieldValue('address', result.address_detail);
          } catch {
            setError('Failed to detect address from map.');
          } finally {
            setGeoLoading(false);
          }
        };

        return (
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
              disabled={!!user}
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

            <p className="mt-4 font-medium text-sky-600">
              Select store location on map
            </p>
            <MapPicker onSelectLocation={handleMapSelect} />

            {geoLoading && (
              <p className="text-sm text-gray-500">Detecting address...</p>
            )}

            <FormField
              id="province"
              name="province"
              label="Province"
              value={values.province}
              onChange={handleChange}
              onBlur={handleBlur}
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
              required
              error={errors.district}
              touched={touched.district}
            />

            <FormField
              id="address"
              name="address"
              label="Full Address (Subdistrict/Place)"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
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
        );
      }}
    </Formik>
  );
};
export default FormContent;
