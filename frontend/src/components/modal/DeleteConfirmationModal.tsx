"use client";

import Modal from "../ui/Modal";
import { Button } from "../ui/Button";

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  itemName,
}: DeleteConfirmationModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
      <p className="mb-6">
        Are you sure you want to delete{" "}
        <span className="font-medium">{itemName ?? "this item"}</span>? This
        action cannot be undone.
      </p>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} className="cursor-pointer">
          Delete
        </Button>
      </div>
    </Modal>
  );
}
