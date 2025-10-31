export interface Category {
  id?: string;
  name: string;
}

export interface Products {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: string;
  images: ProductImage[];
  category: Category;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductFormFieldsProps {
  initialValues: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  isSuperAdmin: boolean;
}

export interface ProductImageUploadProps {
  existingUrls?: string[];
  onChange: (newFiles: File[], remainingUrls: string[]) => void;
  disabled?: boolean;
}

export interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Products | null;
  isSuperAdmin: boolean;
}

export interface ProductTableProps {
  products: Products[];
  onEdit: (product: Products) => void;
  onDelete: (product: Products) => void;
  isSuperAdmin: boolean;
}

export type ProductFormValues = {
  name: string;
  category: number | string; // form inputs usually give string
  description: string;
  price: string;
  existingUrls: string[];
  newFiles: File[];
};
