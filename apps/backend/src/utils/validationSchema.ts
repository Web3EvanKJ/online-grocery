import * as Yup from 'yup';

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
