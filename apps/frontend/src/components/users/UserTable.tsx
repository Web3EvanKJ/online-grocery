'use client';
import { api } from '@/lib/axios';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '../ConfirmationModal';
import { ErrorModal } from '../ErrorModal';
import { User } from '@/lib/types/users/users';
import { UserTableProps } from '@/lib/types/users/users';
import type { AxiosError } from 'axios';

export function UserTable({
  onEdit,
  users,
  fetchUsers,
  loading,
  page,
}: UserTableProps) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      fetchUsers();
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to delete user');
    } finally {
      setOpenConfirm(false);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        {loading ? (
          <p className="py-6 text-center text-sky-600">Loading...</p>
        ) : (
          <table className="min-w-full rounded-lg border border-sky-200 text-sm">
            <thead className="bg-sky-100 text-sky-800">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">City</th>
                <th className="p-3 text-left">District</th>
                <th className="p-3 text-left">Address Details</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-sky-600">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr
                    key={u.id}
                    className="border-t border-sky-100 transition hover:bg-sky-50"
                  >
                    <td className="px-4 py-2">{(page - 1) * 10 + idx + 1}</td>
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 capitalize">
                      {u.role.split('_').length > 1
                        ? u.role.split('_').join(' ')
                        : u.role}
                    </td>
                    <td className="p-3">{u.city}</td>
                    <td className="p-3">{u.district}</td>
                    <td className="p-3">{u.address}</td>
                    <td className="space-x-2 p-3 text-center">
                      {u.role === 'store_admin' ? (
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            className="border-sky-300 text-sky-600 hover:bg-sky-100"
                            onClick={() => onEdit(u)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="border-rose-300 text-rose-500 hover:bg-rose-100"
                            onClick={() => handleDeleteClick(u)}
                          >
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <p className="p-3">No Action Available</p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmationModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete ${userToDelete?.name}?`}
        warning
      />

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </>
  );
}
