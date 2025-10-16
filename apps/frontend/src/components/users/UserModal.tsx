'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

import { ConfirmationModal } from './ConfirmationModal';
import FormContent from './FormContent';
import { validationStoreAdminSchema } from '@/lib/validationSchema';

export function UserModal({ open, setOpen, user }: any) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);

  const handleFinalSubmit = () => {
    if (!pendingValues) return;
    const payload = { ...pendingValues, role: 'store admin' };
    console.log('✅ Final saved data:', payload);

    setConfirmOpen(false);
    setPendingValues(null);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl border border-sky-100 bg-white sm:max-w-lg">
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
        type={'save'}
      />
    </>
  );
}
