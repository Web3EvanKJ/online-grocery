'use client';
import { api } from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { ConfirmationModal } from '../ConfirmationModal';
import { ErrorModal } from '../ErrorModal';
import FormContent from './FormContent';
import { User } from '@/lib/types/users/users';
import type { AxiosError } from 'axios';

type UserModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User | null;
  refreshUsers: () => void;
};

export function UserModal({
  open,
  setOpen,
  user,
  refreshUsers,
}: UserModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<Partial<User> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleFinalSubmit = async () => {
    if (!pendingValues) return;
    try {
      if (user) {
        await api.put(`/admin/users/${user.id}`, pendingValues);
      } else {
        await api.post('/admin/users', pendingValues);
      }
      setConfirmOpen(false);
      setPendingValues(null);
      setOpen(false);
      refreshUsers();
    } catch (err) {
      const error = err as AxiosError<{ msg?: string }>;
      setError(error.response?.data?.msg || 'Failed to delete user');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto rounded-2xl border border-sky-100 bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-semibold text-sky-700">
              {user ? 'Edit Store Admin' : 'Add Store Admin'}
            </DialogTitle>
          </DialogHeader>

          <FormContent
            user={user}
            setPendingValues={setPendingValues}
            setConfirmOpen={setConfirmOpen}
            setOpen={setOpen}
            setError={setError}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFinalSubmit}
        message={'Are you sure you want to save this data?'}
      />

      <ErrorModal
        open={!!error}
        message={error}
        onClose={() => setError(null)}
      />
    </>
  );
}
