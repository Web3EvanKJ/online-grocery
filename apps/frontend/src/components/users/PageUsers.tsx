'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserTable } from '@/components/users/UserTable';
import { UserModal } from '@/components/users/UserModal';
import { UserFilter } from '@/components/users/UserFilter';
import { ErrorModal } from '@/components/ErrorModal';
import { api } from '@/lib/axios';
import { User } from '@/lib/types/users/users';
import type { AxiosError } from 'axios';

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
  const [error, setError] = useState<string | null>('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', {
        params: { page, limit: 10, role: selectedRole, search, sortOrder },
      });
      setUsers(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to get users');
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
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-6 flex flex-row justify-between gap-4 sm:items-center">
          <h1 className="text-xl font-semibold text-sky-700 sm:text-2xl">
            Manage Store Admins
          </h1>
          <Button
            className="bg-sky-500 text-white hover:bg-sky-600"
            onClick={handleAdd}
          >
            + Add Store Admin
          </Button>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full gap-2 sm:w-auto">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search name, email, or address..."
              className="w-full border border-sky-300 px-3 py-2 text-sm focus:border-sky-400 focus:ring-1 focus:ring-sky-400 focus:outline-none sm:w-64"
            />
            <Button
              variant="outline"
              className="border-sky-300 text-sky-700 hover:bg-sky-100"
              onClick={() => {
                setPage(1);
                setSearch(searchText);
              }}
            >
              Search
            </Button>
          </div>

          <div className="flex flex-row gap-2 sm:items-center">
            <UserFilter
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
            />
            <Button
              variant="outline"
              className="border-sky-300 text-sky-700 hover:bg-sky-100"
              onClick={toggleSort}
            >
              Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <UserTable
          onEdit={handleEdit}
          users={users}
          fetchUsers={fetchUsers}
          loading={loading}
          page={page}
        />

        {/* Pagination */}
        <div className="mt-6 flex flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="border-sky-300"
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
            className="border-sky-300"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      <UserModal
        open={openModal}
        setOpen={setOpenModal}
        user={editUser}
        refreshUsers={fetchUsers}
      />

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </>
  );
}
