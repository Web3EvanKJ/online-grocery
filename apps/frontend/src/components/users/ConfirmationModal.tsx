import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

// Confirmation modal component
export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  message,
  type,
}: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border border-sky-100 bg-white sm:max-w-sm">
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
              type == 'save'
                ? 'bg-sky-500 text-white hover:bg-sky-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }
          >
            Yes, Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
