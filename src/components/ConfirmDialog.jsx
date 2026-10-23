import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-aqua-600 hover:bg-aqua-700'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
