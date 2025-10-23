'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTable } from '@/components/users/UserTable';
import { UserModal } from '@/components/users/UserModal';
import { UserFilter } from '@/components/users/UserFilter';
import { ErrorModal } from '@/components/ErrorModal';
import { api } from '@/lib/axios';
import { User } from '@/lib/types/users/users';

export default function PageUsers() {
  const [openModal, setOpenModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', {
        params: { page, limit: 10, role: selectedRole, search, sortOrder },
      });
      setUsers(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err: any) {
      setErrorModal({
        open: true,
        message: err.response?.data?.msg || 'Failed to fetch users',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, page, search, sortOrder]);

  const handleAdd = () => {
    setEditUser(null);
    setOpenModal(true);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setOpenModal(true);
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <>
      <Card className="min-h-screen">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-center text-lg font-semibold text-sky-700 sm:text-left sm:text-xl">
            Manage Store Admins
          </CardTitle>
          <div className="flex justify-center sm:justify-end">
            <Button
              className="w-full bg-sky-500 text-white hover:bg-sky-600 sm:w-auto"
              onClick={handleAdd}
            >
              + Add Store Admin
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search name, email, or address..."
                className="w-full border px-3 py-2 text-sm text-sky-700 focus:ring-1 focus:ring-sky-400 focus:outline-none sm:w-64"
              />
              <Button
                variant="outline"
                className="w-full border-sky-300 text-sky-700 hover:bg-sky-100 sm:w-auto"
                onClick={() => {
                  setPage(1);
                  setSearch(searchText);
                }}
              >
                Search
              </Button>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-4">
              <UserFilter
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
              />
              <Button
                variant="outline"
                className="w-full rounded-md border-sky-300 text-sky-700 hover:bg-sky-100 sm:w-auto"
                onClick={toggleSort}
              >
                Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
              </Button>
            </div>
          </div>

          <UserTable
            onEdit={handleEdit}
            selectedRole={selectedRole}
            users={users}
            fetchUsers={fetchUsers}
            loading={loading}
          />

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-full sm:w-auto"
            >
              Prev
            </Button>
            <span className="text-sm font-medium text-sky-700 sm:text-base">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-full sm:w-auto"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <UserModal
        open={openModal}
        setOpen={setOpenModal}
        user={editUser}
        refreshUsers={fetchUsers}
      />

      <ErrorModal
        open={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ open: false, message: '' })}
      />
    </>
  );
}
