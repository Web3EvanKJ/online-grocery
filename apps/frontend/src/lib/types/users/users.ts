import * as Yup from 'yup';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'store admin' | 'super admin';
  city: string;
  address: string;
};

export type FormContentProps = {
  user: User | null;
  setPendingValues: (values: Partial<User>) => void;
  setConfirmOpen: (open: boolean) => void;
  setOpen: (open: boolean) => void;
  validationSchema: Yup.ObjectSchema<any>; // or stricter below
};
