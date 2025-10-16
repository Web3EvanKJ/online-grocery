'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/users/ConfirmationModal';

export function UserTable({
  onEdit,
  selectedRole,
}: {
  onEdit: (user: any) => void;
  selectedRole: string;
}) {
  const users = [
    {
      id: 1,
      name: 'Rina Hartono',
      email: 'rina@tokoindah.com',
      role: 'store admin',
      province: 'Jawa Barat',
      city: 'Bandung',
    },
    {
      id: 2,
      name: 'Budi Santoso',
      email: 'budi@tokoceria.com',
      role: 'store admin',
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
    },
    {
      id: 3,
      name: 'Siti Nurhaliza',
      email: 'siti@superadmin.com',
      role: 'super admin',
      province: 'Jawa Tengah',
      city: 'Semarang',
    },
    {
      id: 4,
      name: 'Agus Pratama',
      email: 'agus@customer.com',
      role: 'user',
      province: 'Bali',
      city: 'Denpasar',
    },
  ];

  const [openConfirm, setOpenConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  // Filter
  const filteredUsers = selectedRole
    ? users.filter((u) => u.role === selectedRole)
    : users;

  // Trigger when delete clicked
  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setOpenConfirm(true);
  };

  // Confirm deletion
  const handleConfirmDelete = () => {
    console.log('Deleting user:', userToDelete);
    // here you could call your API or update state
    setOpenConfirm(false);
    setUserToDelete(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg border border-sky-200 text-sm">
          <thead className="bg-sky-100 text-sky-800">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-sky-600">
                  No users found for this role.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-sky-100 transition hover:bg-sky-50"
                >
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{u.city}</td>
                  <td className="space-x-2 p-3 text-center">
                    {u.role == 'store admin' ? (
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
      </div>

      {/* Confirmation Modal for delete */}
      <ConfirmationModal
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete ${userToDelete?.name}?`}
        type={'delete'}
      />
    </>
  );
}
