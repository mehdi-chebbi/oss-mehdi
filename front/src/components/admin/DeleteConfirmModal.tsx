import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  open,
  title = "Confirmer la suppression",
  message,
  itemName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl border border-ink/10 w-full max-w-md mx-4 p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-ink/30 hover:text-ink transition-colors"
        >
          <X className="w-5 h-5" aria-label="Fermer" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">{title}</h3>
            <p className="text-sm text-ink/60 mt-1">
              {message}
            </p>
            {itemName && (
              <p className="text-sm font-semibold text-ink mt-1 bg-ink/5 px-2 py-1 rounded">
                {itemName}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-ink/40 mb-5">
          Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-ink/15 text-ink/60 hover:text-ink font-medium rounded-lg transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
