export interface SalesReportItem {
  store_id: number;
  store: string;
  category_id: number;
  category: string;
  product: string;
  totalSales: number;
  period: string;
  status: string;
}

export interface FilterBarProps {
  stores: { id: number | 'all'; name: string }[];
  categories?: { id: number | 'all'; name: string }[];
  selectedStore: string | number;
  selectedCategory?: string | number;
  selectedMonth: string;
  productQuery: string;
  onStoreChange: (val: string) => void;
  onCategoryChange?: (val: string) => void;
  onMonthChange: (val: string) => void;
  onProductQueryChange: (val: string) => void;
  onSearch: () => void;
  isSuperAdmin?: boolean;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface SummaryCardProps {
  title: string;
  value: string | number;
  color?: string;
}
