import * as Yup from 'yup';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'store_admin' | 'super_admin';
  province?: string;
  city?: string;
  district?: string;
  address: string;
  latitude?: number;
  longitude?: number;
};

export type FormContentProps = {
  user: User | null;
  setPendingValues: (values: Partial<User>) => void;
  setConfirmOpen: (open: boolean) => void;
  setOpen: (open: boolean) => void;
  validationSchema: Yup.ObjectSchema<any>; // or stricter below
};
