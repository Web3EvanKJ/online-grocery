import * as Yup from 'yup';

// Define a type for uploaded files
type FileWithType = {
  type: string;
  size: number;
};

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

export const discountValidationSchema = Yup.object({
  product_name: Yup.string().required('Product name is required'),
  value: Yup.number()
    .min(0, 'Value must be greater than zero')
    .required('Value is required'),
  start_date: Yup.date().required('Start date is required'),
  end_date: Yup.date().required('End date is required'),
});
