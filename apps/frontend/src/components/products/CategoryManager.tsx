import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorModal } from '../ErrorModal';
import { ConfirmationModal } from '../ConfirmationModal';
import { Category } from '@/lib/types/categories/categories';
import type { AxiosError } from 'axios';

export function CategoryManager({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [confirmSave, setConfirmSave] = useState<{
    open: boolean;
    action: 'add' | 'edit' | null;
    id?: number;
  }>({ open: false, action: null });
  const [error, setError] = useState<string | null>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories', {
        params: { page, limit: 5 },
      });
      setCategories(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to get categories.');
    }
  };
  useEffect(() => {
    fetchCategories();
  }, [page]);
  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await api.post('/admin/categories', { name: newCategory });
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to create categories.');
    } finally {
      setConfirmSave({ open: false, action: null });
    }
  };
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditedName(cat.name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditedName('');
  };
  const saveEdit = async (id: number) => {
    if (!editedName.trim()) return;
    try {
      await api.put(`/admin/categories/${id}`, { name: editedName });
      setEditingId(null);
      setEditedName('');
      fetchCategories();
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to edit categories.');
    } finally {
      setConfirmSave({ open: false, action: null });
    }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      fetchCategories();
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to delete categories.');
    } finally {
      setDeleteTarget(null);
    }
  };
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
      <h3 className="mb-2 text-lg font-semibold text-sky-700">
        Category Management
      </h3>
      <ul className="mb-3 space-y-2 text-sm">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between rounded bg-white p-2 text-sky-700 shadow-sm"
          >
            {editingId === cat.id ? (
              <div className="flex w-full items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
                <Button
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() =>
                    setConfirmSave({ open: true, action: 'edit', id: cat.id })
                  }
                >
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <span>{cat.name}</span>
                {isSuperAdmin && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(cat)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(cat)}
                      className="border-red-400 text-red-600"
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
      <div className="flex justify-center gap-2 pt-2">
        {/* prettier-ignore */}
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </Button>
        <span className="px-2 py-1 text-sky-700">
          Page {page} of {pagination.totalPages}
        </span>
        {/* prettier-ignore */}
        <Button variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
      {isSuperAdmin && (
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Button
            className="bg-sky-500 hover:bg-sky-600"
            onClick={() => setConfirmSave({ open: true, action: 'add' })}
          >
            Add
          </Button>
        </div>
      )}

      <ConfirmationModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        warning
      />
      <ConfirmationModal
        open={confirmSave.open}
        onClose={() => setConfirmSave({ open: false, action: null })}
        onConfirm={() => {
          if (confirmSave.action === 'add') addCategory();
          if (confirmSave.action === 'edit' && confirmSave.id)
            saveEdit(confirmSave.id);
        }}
        message={
          confirmSave.action === 'add'
            ? `Save new category "${newCategory}"?`
            : `Save changes to "${editedName}"?`
        }
      />
      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </div>
  );
}
