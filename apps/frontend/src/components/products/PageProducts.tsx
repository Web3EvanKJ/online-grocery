// ProductPage.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductModal } from './ProductModal';
import { ProductTable } from './ProductTable';
import { ConfirmationModal } from '../ConfirmationModal';
import { CategoryManager } from './CategoryManager';

export function ProductPage() {
  const userRole = 'super admin'; // ganti sesuai session user
  const isSuperAdmin = userRole === 'super admin';

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Wireless Mouse',
      category: 'Electronics',
      price: 150000,
      stock: 50,
      image: 'https://els.id/wp-content/uploads/2023/09/M210S.png',
    },
    {
      id: 2,
      name: 'Mechanical Keyboard',
      category: 'Electronics',
      price: 650000,
      stock: 30,
      image:
        'https://www.keychron.id/cdn/shop/files/Screenshot2024-03-22103647.png?v=1711143413&width=1214',
    },
    {
      id: 3,
      name: 'Gaming Headset',
      category: 'Electronics',
      price: 350000,
      stock: 40,
      image:
        'https://row.hyperx.com/cdn/shop/files/hyperx_cloud_alpha_wireless_1_main.jpg?v=1745914432',
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDelete = (product: any) => {
    setDeleteTarget(product);
    setConfirmDelete(true);
  };

  const confirmDeleteHandler = () => {
    setProducts(products.filter((p) => p.id !== deleteTarget.id));
    setConfirmDelete(false);
    setDeleteTarget(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
      {/* Left side - Product Table */}
      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-sky-800">
            Product Management
          </h2>
          {isSuperAdmin && (
            <Button
              className="bg-sky-500 text-white hover:bg-sky-600"
              onClick={() => {
                setSelectedProduct(null);
                setModalOpen(true);
              }}
            >
              + Add Product
            </Button>
          )}
        </div>

        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* Right side - Categories */}
      <CategoryManager isSuperAdmin={isSuperAdmin} />

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        isSuperAdmin={isSuperAdmin}
      />

      <ConfirmationModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteHandler}
        message="Are you sure you want to delete this product?"
        warning={true}
      />
    </div>
  );
}
