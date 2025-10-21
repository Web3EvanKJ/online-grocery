'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

import { ConfirmationModal } from '../ConfirmationModal';
import FormContent from './FormContent';
import { validationStoreAdminSchema } from '@/lib/validationSchema';
import { User } from '@/lib/types/users/users';

type UserModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User | null;
};

export function UserModal({ open, setOpen, user }: UserModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<Partial<User> | null>(
    null
  );

  const handleFinalSubmit = () => {
    if (!pendingValues) return;
    const payload = { ...pendingValues, role: 'store admin' as User['role'] };
    console.log('✅ Final saved data:', payload);

    setConfirmOpen(false);
    setPendingValues(null);
    setOpen(false);
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
            validationSchema={validationStoreAdminSchema}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFinalSubmit}
        message={'Are you sure you want to save this data?'}
      />
    </>
  );
}
