export type StockProduct = {
  id: number;
  name: string;
  photo: string;
  stock: number;
  inc: number;
  dec: number;
};

export type InventoryTableProps = {
  data: StockProduct[];
  onEditClick: (product: StockProduct, type: 'increase' | 'decrease') => void;
};

export type EditStockModalProps = {
  open: boolean;
  onClose: () => void;
  product: StockProduct | null;
  type: 'increase' | 'decrease' | '';
  storeId: number;
  onSuccess: () => void;
};

export type PendingValues = { quantity: string; note: string };
