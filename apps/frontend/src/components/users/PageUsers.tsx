'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTable } from '@/components/users/UserTable';
import { UserModal } from '@/components/users/UserModal';
import { UserFilter } from '@/components/users/UserFilter';
import { User } from '@/lib/types/users/users';

const users: User[] = [
  {
    id: 1,
    name: 'Store 1',
    email: 'rina@tokoindah.com',
    role: 'store admin',
    city: 'Bandung',
    address: 'Jl. Sukajadi No. 45, Bandung, Jawa Barat',
  },
  {
    id: 2,
    name: 'Store 106',
    email: 'budi@tokoceria.com',
    role: 'store admin',
    city: 'Jakarta Selatan',
    address: 'Jl. Kemang Raya No. 12, Jakarta Selatan, DKI Jakarta',
  },
  {
    id: 3,
    name: 'Siti Nurhaliza',
    email: 'siti@superadmin.com',
    role: 'super admin',
    city: 'Semarang',
    address: 'Jl. Pandanaran No. 30, Semarang, Jawa Tengah',
  },
  {
    id: 4,
    name: 'Agus Pratama',
    email: 'agus@customer.com',
    role: 'user',
    city: 'Denpasar',
    address: 'Jl. Teuku Umar No. 20, Denpasar, Bali',
  },
];

export default function PageUsers() {
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');

  const handleAdd = () => {
    setEditUser(null);
    setOpenModal(true);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setOpenModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white p-6">
      <Card className="rounded-2xl border border-sky-200 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-sky-700">
            Manage Store Admins
          </CardTitle>
          <Button
            className="bg-sky-500 text-white hover:bg-sky-600"
            onClick={handleAdd}
          >
            + Add Store Admin
          </Button>
        </CardHeader>

        <CardContent>
          <UserFilter
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />
          <UserTable
            onEdit={handleEdit}
            selectedRole={selectedRole}
            users={users}
          />
        </CardContent>
      </Card>

      <UserModal open={openModal} setOpen={setOpenModal} user={editUser} />
    </div>
  );
}
