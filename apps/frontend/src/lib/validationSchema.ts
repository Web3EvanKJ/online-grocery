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

export const productValidationSchema = (isEdit: boolean) =>
  Yup.object({
    name: Yup.string().required('Product name is required'),
    category: Yup.string().required('Category is required'),
    price: Yup.number()
      .typeError('Price must be a number')
      .positive('Price must be greater than zero')
      .required('Price is required'),
    stock: Yup.number()
      .typeError('Stock must be a number')
      .integer('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .required('Stock is required'),
    images: Yup.array()
      .of(
        Yup.mixed()
          .test(
            'fileType',
            'Only .jpg, .jpeg, .png, .gif are allowed',
            (value: any) => {
              if (!value) return false;
              return [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
              ].includes(value.type);
            }
          )
          .test('fileSize', 'Max file size is 1MB', (value: any) => {
            if (!value) return false;
            return value.size <= 1024 * 1024;
          })
      )
      .test('requiredWhenCreate', 'Product image is required', (value) => {
        if (isEdit) return true; // ✅ skip validation if editing
        return value && value.length > 0;
      }),
  });

export const inventoryValidationSchema = Yup.object().shape({
  quantity: Yup.number()
    .required('Must be filled')
    .min(1, 'Minimum 1')
    .test(
      'non-negative-stock',
      'Final stock cannot be less than zero',
      function (value) {
        const { stock, inc, dec, type } = this.parent;

        // If no value or not a decrease operation, skip check
        if (!value || type !== 'decrease') return true;

        const finalStock = stock + inc - (dec + value);
        return finalStock >= 0;
      }
    ),
  note: Yup.string().optional(),
});

export const discountValidationSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  value: Yup.number().min(0).required('Required'),
  product: Yup.string().required('Required'),
  startDate: Yup.date().required('Required'),
  endDate: Yup.date().required('Required'),
});
