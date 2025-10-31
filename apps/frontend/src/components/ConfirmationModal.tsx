import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmationModalProps } from '@/lib/types/global/global';

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  message = 'Are you sure?',
  warning = false,
}: ConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border border-sky-100 bg-white sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-semibold text-sky-700">
            Confirm Action
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 text-gray-700">{message}</div>
        <div className="mt-5 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-sky-300 text-sky-600 hover:bg-sky-50"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={
              warning
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-sky-500 text-white hover:bg-sky-600'
            }
          >
            Yes, Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
