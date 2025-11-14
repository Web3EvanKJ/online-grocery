import {
  Package,
  Tag,
  ClipboardList,
  BarChart2,
  PieChart,
  Users,
} from 'lucide-react';

export const sections = [
  {
    title: 'Products and Categories',
    description: 'Add, edit, or remove product listings and categories.',
    icon: () => <Package className="h-6 w-6 text-sky-600" />,
    href: '/admin/products',
  },
  {
    title: 'Inventories',
    description: 'Monitor and update product stock levels',
    icon: () => <ClipboardList className="h-6 w-6 text-sky-600" />,
    href: '/admin/inventories',
  },
  {
    title: 'Discounts',
    description: 'Manage product discounts and promotions',
    icon: () => <Tag className="h-6 w-6 text-sky-600" />,
    href: '/admin/discounts',
  },
  {
    title: 'Sales Report',
    description: 'Analyze sales performance and revenue',
    icon: () => <BarChart2 className="h-6 w-6 text-sky-600" />,
    href: '/admin/reports/sales',
  },
  {
    title: 'Stock Report',
    description: 'View and track inventory movement',
    icon: () => <PieChart className="h-6 w-6 text-sky-600" />,
    href: '/admin/reports/stocks',
  },
  {
    title: 'Users',
    description: 'Manage admin and customer accounts',
    icon: () => <Users className="h-6 w-6 text-sky-600" />,
    href: '/admin/users',
    superAdmin: true,
  },
];
