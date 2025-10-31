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
    | FormikErrors<any>
    | FormikErrors<any>[]
    | undefined;
  touched?: boolean | FormikTouched<any> | FormikTouched<any>[] | undefined;
  disabled?: boolean;
}

export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  warning?: boolean;
}

export interface ErrorModalProps {
  open: boolean;
  message?: string | null;
  onClose: () => void;
}
