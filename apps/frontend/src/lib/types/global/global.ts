import { FormikErrors, FormikTouched } from 'formik';

export interface FormFieldProps {
  id: string;
  name: string;
  label?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  error?:
    | string
    | string[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | FormikErrors<any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | FormikErrors<any>[]
    | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  touched?: boolean | FormikTouched<any> | FormikTouched<any>[] | undefined;
  disabled?: boolean;
}

export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  warning?: boolean;
  loading?: boolean;
}

export interface ErrorModalProps {
  open: boolean;
  message?: string | null;
  onClose: () => void;
}

export type ProductCardProps = {
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  discount?: number;
  discountInputType?: string;
  stock?: boolean | number;
  isb1g1?: boolean;
};
