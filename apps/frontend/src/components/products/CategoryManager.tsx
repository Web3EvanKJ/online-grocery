'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationModal } from '../ConfirmationModal';

type Props = {
  isSuperAdmin: boolean;
};

export function CategoryManager({ isSuperAdmin }: Props) {
  const [categories, setCategories] = useState<string[]>([
    'Electronics',
    'Clothing',
    'Food',
  ]);
  const [newCat, setNewCat] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: 'add' | 'edit' | 'delete' | null;
  }>({ open: false, action: null });

  const isReadOnly = !isSuperAdmin;

  // --- CRUD Handlers ---
  const handleAddCategory = () => {
    if (!newCat.trim() || categories.includes(newCat)) return;
    setConfirmModal({ open: true, action: 'add' });
  };

  const confirmAdd = () => {
    setCategories([...categories, newCat]);
    setNewCat('');
    setConfirmModal({ open: false, action: null });
  };

  const handleEditClick = (cat: string) => {
    setEditingCat(cat);
    setEditValue(cat);
    setConfirmModal({ open: true, action: 'edit' });
  };

  const confirmEdit = () => {
    if (editValue.trim()) {
      setCategories(categories.map((c) => (c === editingCat ? editValue : c)));
    }
    setEditingCat(null);
    setEditValue('');
    setConfirmModal({ open: false, action: null });
  };

  const handleDeleteClick = (cat: string) => {
    setDeleteTarget(cat);
    setConfirmModal({ open: true, action: 'delete' });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setCategories(categories.filter((c) => c !== deleteTarget));
      setDeleteTarget(null);
    }
    setConfirmModal({ open: false, action: null });
  };

  return (
    <div className="border border-sky-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-sky-700">Categories</h3>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat}
            className="flex items-center justify-between rounded-md bg-sky-50 px-3 py-2 text-sky-800"
          >
            {editingCat === cat ? (
              <div className="flex w-full gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-sky-700"
                  disabled={isReadOnly}
                />
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setConfirmModal({ open: true, action: 'edit' })
                      }
                      className="bg-sky-500 text-white hover:bg-sky-600"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingCat(null)}
                      className="border-sky-300 text-sky-600 hover:bg-sky-50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <span>{cat}</span>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(cat)}
                      className="border-sky-300 text-sky-600 hover:bg-sky-100"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(cat)}
                      className="border-rose-300 text-rose-500 hover:bg-rose-100"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      {!isReadOnly && (
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Add new category"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
          />
          <Button
            onClick={handleAddCategory}
            className="bg-sky-500 text-white hover:bg-sky-600"
          >
            Add
          </Button>
        </div>
      )}

      {/* Confirmation Modal (for add/delete/edit) */}
      <ConfirmationModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, action: null })}
        onConfirm={
          confirmModal.action === 'add'
            ? confirmAdd
            : confirmModal.action === 'edit'
              ? confirmEdit
              : confirmDelete
        }
        message={
          confirmModal.action === 'edit'
            ? 'Are you sure want to save this categories?'
            : 'Are you sure want to delete this categories?'
        }
        warning={confirmModal.action === 'delete'}
      />
    </div>
  );
}
