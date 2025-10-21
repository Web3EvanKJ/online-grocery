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

export const productValidationSchema = (isEdit: boolean) =>
  Yup.object({
    name: Yup.string().required('Product name is required'),
    category: Yup.string().required('Category is required'),
    price: Yup.number()
      .typeError('Price must be a number')
      .positive('Price must be greater than zero')
      .required('Price is required'),
    description: Yup.string()
      .max(500, 'Description cannot exceed 500 characters')
      .required('Description is required'),
    images: Yup.array()
      .of(
        Yup.mixed<FileWithType>()
          .test(
            'fileType',
            'Only .jpg, .jpeg, .png, .gif are allowed',
            (value): boolean => {
              if (!value) return false;
              return [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
              ].includes(value.type);
            }
          )
          .test('fileSize', 'Max file size is 1MB', (value): boolean => {
            if (!value) return false;
            return value.size <= 1024 * 1024;
          })
      )
      .test('requiredWhenCreate', 'Product image is required', (value) => {
        if (isEdit) return true;
        return !!(value && value.length > 0);
      }),
  });

export const inventoryValidationSchema = Yup.object({
  quantity: Yup.number()
    .required('Must be filled')
    .min(1, 'Minimum 1')
    .test(
      'non-negative-stock',
      'Final stock cannot be less than zero',
      function (value) {
        const parent = this.parent as {
          stock: number;
          inc: number;
          dec: number;
          type: 'increase' | 'decrease';
        };

        if (!value || parent.type !== 'decrease') return true;

        const finalStock = parent.stock + parent.inc - (parent.dec + value);
        return finalStock >= 0;
      }
    ),
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
