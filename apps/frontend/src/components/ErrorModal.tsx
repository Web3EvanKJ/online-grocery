'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ErrorModal({ open, message, onClose }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border border-red-100 bg-white">
        <DialogHeader>
          <DialogTitle className="font-semibold text-red-600">
            Error
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-700">{message}</p>
        <DialogFooter className="mt-4">
          <Button
            onClick={onClose}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
