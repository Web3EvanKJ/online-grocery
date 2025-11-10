import * as Yup from 'yup';

export const validationStoreAdminSchema = Yup.object({
  name: Yup.string().required('Full name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  province: Yup.string().required('Province is required'),
  city: Yup.string().required('City / Regency is required'),
  district: Yup.string().required('District is required'),
  address: Yup.string().required('Address is required'),
});

export const productValidationSchema = Yup.object().shape({
  name: Yup.string().required('Product name is required'),
  category: Yup.string().required('Category is required'),
  price: Yup.number().positive().required('Price is required'),
  description: Yup.string().required('Description is required'),

  existingUrls: Yup.array()
    .of(Yup.string())
    .default([])
    .test(
      'at-least-one-image-existing',
      'At least one product image is required',
      function (existingUrls) {
        const { newFiles } = this.parent;
        const hasExisting =
          Array.isArray(existingUrls) && existingUrls.length > 0;
        const hasNew = Array.isArray(newFiles) && newFiles.length > 0;
        return hasExisting || hasNew;
      }
    ),

  newFiles: Yup.array()
    .of(Yup.mixed())
    .default([])
    .test(
      'at-least-one-image-new',
      'At least one product image is required',
      function (newFiles) {
        const { existingUrls } = this.parent;
        const hasExisting =
          Array.isArray(existingUrls) && existingUrls.length > 0;
        const hasNew = Array.isArray(newFiles) && newFiles.length > 0;
        return hasExisting || hasNew;
      }
    ),
});

export const inventoryValidationSchema = Yup.object({
  quantity: Yup.number().required('Must be filled').min(1, 'Minimum 1'),
  note: Yup.string().optional(),
});

export const discountFormValidationSchema = Yup.object().shape({
  type: Yup.string()
    .oneOf(['product', 'store', 'b1g1'])
    .required('Discount type is required'),

  // Input type only required if NOT b1g1
  inputType: Yup.string()
    .oneOf(['percentage', 'nominal'])
    .when('type', {
      is: (val: string) => val !== 'b1g1',
      then: (schema) => schema.required('Input type is required'),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  // Value only required if NOT b1g1
  value: Yup.number().when('type', {
    is: (val: string) => val !== 'b1g1',
    then: (schema) =>
      schema.required('Value is required').min(1, 'Must be > 0'),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),

  min_purchase: Yup.number().nullable(),
  max_discount: Yup.number().nullable(),

  start_date: Yup.string().required('Start date is required'),
  end_date: Yup.string().required('End date is required'),

  // product_id only required if NOT store
  product_id: Yup.number().when('type', {
    is: (val: string) => val !== 'store',
    then: (schema) => schema.required('Valid product name is required'),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});
