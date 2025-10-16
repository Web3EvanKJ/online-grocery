'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTable } from '@/components/users/UserTable';
import { UserModal } from '@/components/users/UserModal';
import { UserFilter } from '@/components/users/UserFilter';

export default function AdminUsersPage() {
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  const handleAdd = () => {
    setEditUser(null);
    setOpenModal(true);
  };

  const handleEdit = (user: any) => {
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
          <UserTable onEdit={handleEdit} selectedRole={selectedRole} />
        </CardContent>
      </Card>

      <UserModal open={openModal} setOpen={setOpenModal} user={editUser} />
    </div>
  );
}
